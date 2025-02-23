const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

function getTransactions() {
    const data = fs.readFileSync('transactions.json');
    return JSON.parse(data);
}

function saveTransactions(transactions) {
    fs.writeFileSync('transactions.json', JSON.stringify(transactions, null, 2));
}

function createTransaction(product, username, whatsapp, amount, qrData) {
    const transactionId = uuidv4();
    const newTransaction = {
        id: transactionId,
        productId: product.id,
        product: product,
        username,
        whatsapp,
        amount: amount,
        qrImageUrl: qrData.qrImageUrl,
        qrisData: qrData.qrisData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expirationTime: new Date(qrData.expirationTime).toISOString(),
        status: 'pending'
    };
    return newTransaction;
}

module.exports = {
    getTransactions,
    saveTransactions,
    createTransaction
};
