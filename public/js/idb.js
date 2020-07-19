let db;
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    //open a transaction in the db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // access the object
    const transactionObjectStore = transaction.objectStore('new_transaction');
    // add new record
    transactionObjectStore.add(record);
}

function uploadTransaction() {
    //open a transaction in the db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // access the object
    const transactionObjectStore = transaction.objectStore('new_transaction');

    //get all records from storage
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                    method: 'POST',
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse)
                    }
                    //open a transaction in the db
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    // access the object
                    const transactionObjectStore = transaction.objectStore('new_transaction');
                    //clear all records
                    transactionObjectStore.clear();
                    alert('All saved transaction has been submitted!');
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
}

window.addEventListener('online', uploadTransaction);