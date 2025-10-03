function addNumbers() {
    // 獲取輸入值
    const num1 = parseFloat(document.getElementById('num1').value);
    const num2 = parseFloat(document.getElementById('num2').value);
    
    // 檢查輸入是否為有效數字
    if (isNaN(num1) || isNaN(num2)) {
        document.getElementById('result').textContent = '請輸入有效的數字';
        return;
    }
    
    // 計算總和
    const sum = num1 + num2;
    
    // 顯示結果
    document.getElementById('result').textContent = sum;
}
