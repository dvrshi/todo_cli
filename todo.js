var mysql = require('mysql');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "pass",
    database: "db"
})


async function main() {
    try {
        await connectDatabase();
        await createTable();
        listApp();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // console.log("end")
        // con.end();
    }
}

function connectDatabase() {
    return new Promise((resolve, reject) => {
        con.connect((err) => {
            if (err) {
                reject('Error connecting to database: ' + err);
            } else {
                console.log("Connection successful");
                resolve();
            }
        });
    });
}

function createTable() {
    return new Promise((resolve, reject) => {
        const sql = "CREATE TABLE IF NOT EXISTS tasks (id int unsigned primary KEY AUTO_INCREMENT, task VARCHAR(255), status varchar(10) default 'pending')";
        con.query(sql, function (err, result) {
            if (err) {
                reject('Error creating table: ' + err);
            } else {
                console.log("Table created");
                resolve();
            }
        });
    });
}
function addRow(userInput) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO tasks(task) VALUES ('${userInput[1]}')`;
        con.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                reject('Error inserting data');
            } else {
                console.log('Data inserted');
                resolve(listApp());
            }
        });
    });
}
function showTable(userInput) {
    return new Promise((resolve, reject) => {

        var sql = `SELECT * FROM tasks;`;
        if (userInput[1] === 'pending')
            sql = `SELECT * FROM tasks where status = 'pending';`
        if (userInput[1] === 'done')
            sql = `SELECT * FROM tasks where status = 'done';`
        con.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                reject('Error inserting data');
            } else {
                console.table(result);
                resolve(listApp());
            }
        });
    });
}
function doneTask(userInput) {
    return new Promise((resolve, reject) => {

        var sql = `UPDATE tasks
        set status = 'done'
        where task = '${userInput[1]}'`

        con.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                reject('Error inserting data');
            } else {
                console.log('Task done');
                resolve(listApp());
            }
        });
    });
}
function deleteTask(userInput) {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM tasks WHERE task = '${userInput[1]}'`;

        con.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                reject('Error deleting data');
            } else {
                console.log('Task deleted');
                resolve(listApp());
            }
        });
    });
}
function listApp() {
    console.log("--new");
    console.log("--list [all|pending|done]");
    console.log("--done taskname");
    console.log("--delete taskname");

    (async () => {
        try {
            const userInput = await new Promise((resolve, reject) => {
                rl.question("Input example --new task\n", function (string) {
                    const userInput = string.split(" ");
                    console.log(userInput[0]);
                    // rl.close();

                    resolve(userInput);
                });
            });
            switch (userInput[0]) {
                case '--new':
                    await addRow(userInput);
                    break;
                case '--list':
                    await showTable(userInput);
                    break;
                case '--done':
                    await doneTask(userInput);
                    break;
            }
            // console.log(userInput);
        } catch (error) {
            console.error("An error occurred:", error);
        }
    })();
}
main();