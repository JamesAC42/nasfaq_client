const fetchData = (url:string) => {
    return new Promise((resolve:any, reject:any) => {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    })
}

export default fetchData;