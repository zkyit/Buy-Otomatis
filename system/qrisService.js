const axios = require('axios');

async function checkQRISStatus(transactionId, amount) {
    try {
        const apiUrl = `https://gateway.okeconnect.com/api/mutasi/qris/OK1356619/945929417281946251356619OKCT0FDE62AC1D67A2B9DE82CC2609421146`;
        const response = await axios.get(apiUrl);
        const result = response.data;
        const latestTransaction = result.data && result.data.length > 0 ? result.data[0] : null;

        if (!latestTransaction) {
            throw new Error('Data mutasi tidak tersedia.');
        }

        if (parseInt(latestTransaction.amount) === parseInt(amount)) {
            return 'succeeded';
        } else {
            return 'pending';
        }
    } catch (error) {
        console.error('Error in checkQRISStatus:', error);
        throw error;
    }
}

module.exports = {
    checkQRISStatus
};
