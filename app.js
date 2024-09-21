const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const {
  loadContacts,
  findContact,
  addContact,
  checkDuplicate,
  deleteContact,
  updateContacts,
} = require('./utils/contacts');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Third party middleware
app.use(expressLayouts);
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(flash());

// Built-in middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { layout: 'layouts/main-layout', title: 'Home' });
});

app.get('/about', (req, res) => {
  res.render('about', { layout: 'layouts/main-layout', title: 'About' });
});

app.get('/contact', (req, res) => {
  const contacts = loadContacts();
  res.render('contact', {
    layout: 'layouts/main-layout',
    title: 'Contact',
    contacts,
    msg: req.flash('msg'),
  });
});

app.get('/contact/add', (req, res) => {
  res.render('add-contact', { layout: 'layouts/main-layout', title: 'Add Contact Form' });
});

app.get('/contact/edit/:name', (req, res) => {
  const contact = findContact(req.params.name);
  res.render('edit-contact', {
    layout: 'layouts/main-layout',
    title: 'Edit Contact Form',
    contact,
  });
});

app.post(
  '/contact',
  [
    body('name').custom((value) => {
      const duplikat = checkDuplicate(value);
      if (duplikat) {
        throw new Error('Contact name already exists');
      }
      return true;
    }),
    check('email', 'Invalid e-mail').isEmail(),
    check('phone', 'Invalid phone number').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('add-contact', {
        title: 'Add Contact Form',
        layout: 'layouts/main-layout',
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      req.flash('msg', 'Contact has been added!');
      res.redirect('/contact');
    }
  },
);

app.post(
  '/contact/update',
  [
    body('name').custom((value, { req }) => {
      const duplikat = checkDuplicate(value);
      if (value !== req.body.oldName && duplikat) {
        throw new Error('Contact name already exists');
      }
      return true;
    }),
    check('email', 'Invalid e-mail').isEmail(),
    check('phone', 'Invalid phone number').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('edit-contact', {
        title: 'Edit Contact Form',
        layout: 'layouts/main-layout',
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      req.flash('msg', 'Contact has been edited!');
      res.redirect('/contact');
    }
  },
);

app.get('/contact/delete/:name', (req, res) => {
  const { name } = req.params;
  const contact = findContact(name);

  if (!contact) {
    res.status(404);
    res.send('<h1>404</h1>');
  } else {
    deleteContact(name);
    req.flash('msg', 'Contact has been deleted!');
    res.redirect('/contact');
  }
});

app.get('/contact/:name', (req, res) => {
  const contact = findContact(req.params.name);

  res.render('detail', { layout: 'layouts/main-layout', title: 'Contact Detail Page', contact });
});

app.use('/', (req, res) => {
  res.status(404);
  res.send('<h1>404</h1>');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
