let tripDays = 2;
let nextDayNumber = 2;

function addNewDay() {
    
    // 追加される日程ボックスを作成
    const input = document.querySelector(".input-place");
    const div = document.createElement('div');
        div.classList.add('day');
    div.innerHTML = `
        <h3>${nextDayNumber}日目</h3>
        <label>出発地: </label>
        <label>到着地: </label>
    `;
    const lastDay = document.querySelector('#last-day');
    input.insertBefore(div, lastDay);

    tripDays++;
    document.getElementById("trip-days").textContent = tripDays;

    nextDayNumber++;

    updateDayNumbers();
}

function deleteDay(button) {
    const days = document.querySelectorAll('.day');
    if (days.length > 2) {
        const lastDay = days[days.length -2];
        lastDay.remove();

        tripDays--;
        document.getElementById('trip-days').textContent = tripDays;

        nextDayNumber--;

        updateDayNumbers();
    }

    const dayDiv = button.parentElement;
    dayDiv.remove();
    updateDayNumbers();
}

function updateDayNumbers() {
    const days = document.querySelectorAll('.day');
    days.forEach((day, index) => {
        const h3 = day.querySelector('h3.number');
        if (index === days.length - 1) {
            h3.innerHTML = "最終日";
        } else {
            h3.innerHTML = `${index + 1}日目`;
        }
    });
}