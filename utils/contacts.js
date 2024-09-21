const fs = require('fs');

const dirPath = './data';
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

const dataPath = './data/contacts.json';
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]', 'utf-8');
}

const loadContacts = () => {
  const data = fs.readFileSync('data/contacts.json', 'utf-8');
  const contacts = JSON.parse(data);
  return contacts;
};

const findContact = (name) => {
  const contacts = loadContacts();
  const contact = contacts.find((contact) => contact.name === name);
  return contact;
};

const saveContacts = (contacts) => {
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
};

const addContact = (contact) => {
  const contacts = loadContacts();
  contacts.push(contact);
  saveContacts(contacts);
};

const checkDuplicate = (name) => {
  const contacts = loadContacts();
  return contacts.find((contact) => contact.name === name);
};

const deleteContact = (name) => {
  const contacts = loadContacts();
  const filteredContacts = contacts.filter((contact) => contact.name !== name);
  saveContacts(filteredContacts);
};

const updateContacts = (newContact) => {
  const contacts = loadContacts();
  const filteredContacts = contacts.filter((contact) => contact.name !== newContact.oldName);
  delete newContact.oldName;
  filteredContacts.push(newContact);
  saveContacts(filteredContacts);
};

module.exports = {
  loadContacts,
  findContact,
  addContact,
  checkDuplicate,
  deleteContact,
  updateContacts,
};
