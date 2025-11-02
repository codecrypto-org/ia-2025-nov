"use strict";
class Calculator {
    constructor() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.display = document.getElementById('display');
    }
    appendNumber(number) {
        if (this.shouldResetDisplay) {
            this.currentValue = number;
            this.shouldResetDisplay = false;
        }
        else {
            if (this.currentValue === '0') {
                this.currentValue = number;
            }
            else {
                this.currentValue += number;
            }
        }
        this.updateDisplay();
    }
    appendDecimal() {
        if (this.shouldResetDisplay) {
            this.currentValue = '0.';
            this.shouldResetDisplay = false;
        }
        else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }
    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.updateDisplay();
    }
    toggleSign() {
        if (this.currentValue !== '0') {
            if (this.currentValue.startsWith('-')) {
                this.currentValue = this.currentValue.substring(1);
            }
            else {
                this.currentValue = '-' + this.currentValue;
            }
            this.updateDisplay();
        }
    }
    percent() {
        const value = parseFloat(this.currentValue);
        this.currentValue = (value / 100).toString();
        this.updateDisplay();
    }
    setOperation(op) {
        if (this.operation !== null && !this.shouldResetDisplay) {
            this.calculate();
        }
        this.previousValue = this.currentValue;
        this.operation = op;
        this.shouldResetDisplay = true;
    }
    calculate() {
        if (this.operation === null || this.previousValue === '') {
            return;
        }
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result = 0;
        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.currentValue = 'Error';
                    this.updateDisplay();
                    this.operation = null;
                    this.previousValue = '';
                    this.shouldResetDisplay = true;
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }
        this.currentValue = this.formatResult(result);
        this.operation = null;
        this.previousValue = '';
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }
    formatResult(value) {
        // Round to 10 decimal places to avoid floating point errors
        const rounded = Math.round(value * 10000000000) / 10000000000;
        return rounded.toString();
    }
    updateDisplay() {
        this.display.textContent = this.currentValue;
    }
}
// Initialize calculator
const calculator = new Calculator();
