export const buyCoin = (coin:string) => {
    fetch('/api/buyCoin/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            coin
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            //this.updateTransactionStatus();
        }
    })
    .catch(error => {
        console.error('Error: ' +  error);
    })
}

export const sellCoin = (coin:string) => {
    fetch('/api/sellCoin/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            coin
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            //this.updateTransactionStatus();
        }
    })
    .catch(error => {
        console.error('Error: ' +  error);
    })
}