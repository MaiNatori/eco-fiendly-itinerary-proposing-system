function addNewDay() {
    // 追加される日程ボックスを作成
    const input = document.querySelector(".input-place");
    const div = document.createElement('div');
        div.classList.add('day');
    const h3 = document.createElement("h3");
        const dayNumber =  document.querySelectorAll('.day').length + 1; // 現在の日程数に1を足して次の日程を計算
        h3.innerHTML = `${dayNumber}日目`;
    const labelStart = document.createElement("label");
        labelStart.innerHTML = "出発地: ";
    const labelGoal = document.createElement("label");
        labelGoal.innerHTML = "到着地: ";
    const button = document.createElement("input");
        button.setAttribute("type", "submit");
        button.setAttribute("method", "post");
        button.setAttribute("name", "confirm");
        button.setAttribute("value", "確定");
        button.classList.add("button");

    div.appendChild(h3);
    div.appendChild(labelStart);
    div.appendChild(labelGoal);
    div.appendChild(button);
    input.appendChild(div);
    
    // plus-buttonの前に新しい日程ボックスを挿入
    const plusButton = document.querySelector('.plus-button');
    plusButton.parentNode.insertBefore(dayElement, plusButton);
};