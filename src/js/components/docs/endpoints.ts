export const endpoints = [
    {
        name:"/trade",
        description:"Make a request to trade a list of coins.",
        url:"https://nasfaq.biz/api/trade",
        type:"POST",
        parameters:"An object with a key called 'orders' is sent in the request body. 'orders' is an array of Order objects. Each Order object contains a key called 'coin' containing the name of the coin to trade, a field called 'quantity' with a number 1-5 indicating how many coins to trade in the given order, and a field called 'type' that is set to either 0 or 1. 0 means buy, 1 means sell.",
        response:"The response will be an object with a field called 'success' set to either true or false. True indicates the order was processed, it does not guarantee the order went through. False indicates there was an error or a reason the order could not be completed. The reason will be included in a field called 'message' if it did not go through."
    },
    {
        name:"/getMarketInfo",
        description:"Returns the current market information for the requested coins, including ask and bid price, volume, and the rolling price history if requested.",
        url:"https://nasfaq.biz/api/getMarketInfo",
        type:"GET",
        parameters:"Query parameters include a field called 'coins' that indicates which coins to get the information for, e.g. ?coins=miko,korone... If you wish to retrieve all coins, set the ?all field. You can turn off price, saleValue, or volume by setting ?price=false, ?saleValue=false, ?inCirculation=false, or any combination of the three. You can turn on the rolling history by setting ?history",
        response:"A coinInfo object containing a timestamp and a data field that stores an object mapping the coin names to the requested properties, in addition to the open/closed state of the market."
    },
    {
        name:"/getDividends",
        description:"Returns the latest dividend information of each coin.",
        url:"https://nasfaq.biz/api/getDividends",
        type:"GET",
        parameters:"none",
        response:"An object containing a 'success' field, a field called 'dividends' containing the timestamp when the dividends were paid and a field called payouts mapping each coin to the amount they paid."
    },
    {
        name:"/getLeaderboard",
        description:"Returns the requested leaderboards",
        url:"https://nasfaq.biz/api/getLeaderboards",
        type:"GET",
        parameters:"Takes 2 URL query parameters indicating which leaderboard to get. Set either ?leaderboard, ?oshiboard, or both to get the networth leaderboard and the oshiboard",
        response:"An object with fields called 'leaderboard' and 'oshiboard' depending on what was requested. These contain the leaderboard data."
    },
    {
        name:"/getUserInfo",
        description:"Gets the user information for the currently signed in user. The client making the request must have a valid session.",
        url:"https://nasfaq.biz/api/getUserInfo",
        type:"GET",
        parameters:"none",
        response:"An object containing the fields 'loggedout', 'username', 'id', 'email', 'performance', 'verified', 'wallet', 'icon', 'admin', 'settings', 'color', 'muted', and 'items'."
    },
    {
        name:"/getUserWallet",
        description:"Retrieves the contents of the requested user's wallet. The user must have made their wallet public in order to get the data.",
        url:"https://nasfaq.biz/api/getUserWallet",
        type:"GET",
        parameters:"Takes a query parameter called 'userid', the id of the user to get the wallet of.",
        response:"An object containing a field called 'success' and a field called 'wallet'. Success is true if the wallet was retrieved, and false with a message why if not. The wallet field contains a wallet object with a field called 'balance' and 'coins'. Balance contains the balance of the user, coins contains a mapping of coins to 'timestamp' (when that coin was last traded by the user), 'amt', and 'meanPurchasePrice'."
    },
    {
        name:"/getSession",
        description:"Returns whether a valid session exists with the requesting client or not",
        url:"https://nasfaq.biz/api/getSession",
        type:"GET",
        parameters:"none",
        response:"An object containing a field called 'loggedout', indicating whether the user is logged out or not."
    },
    {
        name:"/getMarketSwitch",
        description:"Returns the current state of the market switch. True means the market is open, false indicates the market is closed.",
        url:"https://nasfaq.biz/api/getMarketSwitch",
        type:"GET",
        parameters:"none",
        response:"An object containing a field called 'success' and a field called 'marketSwitch'"
    }
]