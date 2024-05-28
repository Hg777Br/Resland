export class Storage {
  constructor(){
    // Selecting local storage type: indexedDb / Session Storage
    var indexedDb = window.indexedDB.open('todo_db', 1);
    indexedDb.addEventListener('error', () => console.error('Error opening DB'));
  }
  
}


//https://blog.logrocket.com/using-indexeddb-complete-guide/