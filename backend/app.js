const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

const sequelize = require('./util/database')
const signupRoutes = require('./routes/signup');
const loginRoutes = require('./routes/login');
const expenseRoutes = require('./routes/expense');
const premiumRoutes = require('./routes/premium');
const passwordRoutes = require('./routes/password');

const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const Requests = require('./models/requests');
const Download = require('./models/downloadedFiles');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('combined',{stream: accessLogStream}));
app.use(express.static(path.join(__dirname, "views/frontend")));

app.get((req, res) => {
    const url = req.url;
    res.sendFile(path.join(__dirname, `${url}`));
});
app.get("/favicon.ico", (req, res) => res.status(204));

app.use('/signup', signupRoutes)
app.use('/login', loginRoutes)
app.use('/expense' , expenseRoutes)
app.use('/premium', premiumRoutes)
app.use('/password', passwordRoutes)

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Requests);
Requests.belongsTo(User);

User.hasMany(Download);
Download.belongsTo(User);

sequelize.sync()
    .then(result => {
        app.listen(process.env.PORT || 3000, () => {
            //console.log(result)
            console.log("Server running in 3000")
        });
    })
    .catch(err => {
        console.log(err);
    });