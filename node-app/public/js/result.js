// index.jsにアクセスしてselectedHotelsを取得する
function fetchSelects() {
    fetch("/interfaceroute")
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        };
      return response.json();
      })
      .then(data => {
        const selectSpots = data.selectSpots;
        const selectHotels = data.selectHotels;
        console.log("selectSpots: ", selectSpots);
        console.log("selectHotels: ", selectHotels);
      })
      .catch(error => {
        console.error("Error fetching data: ", error);
      });
}

fetchSelects();