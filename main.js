import draw from "./draw.js";


// Cases:
// 0 - members: n, irn, pv, fv, pn 
// 1 - input: n, irn, pv/pn output: fv
// 2 - input: n, irn, fv/pn output: pv
// 3 - input: irn, pv/pn, fv output: n
// 4 - input: n, pv/pn, fv output: irn
// 5 - input: n, irn, pv, fv output: pn
// TEST: test with simple data
// TODO: check if the inputs are valid and consistent values, embebed draw.js in this class, insert alerts?, used toFixed() or toPrecision() and eliminate the round() method?, reuse the value showed to eventual operator operation (maybe put The ... in the expression field and the result in the number field)
// FIXME: the monthly calculation is not correct, after insert a fv and recalculate then.



class Calculator {
    e_expression = document.querySelector("[data-expression]");
    e_number = document.querySelector("[data-current]");
    e_pv = document.querySelector("[data-pv]");
    e_fv = document.querySelector("[data-fv]");
    e_n = document.querySelector("[data-n]");
    e_pn = document.querySelector("[data-pn]");
    e_irn = document.querySelector("[data-irn]");
    e_tot = document.querySelector("[data-tot]");
    s_expression = '';
    s_number = '0';
    n_pv = 0.0;
    n_fv = 0.0;
    i_n = 0;
    n_pn = 0.0;
    n_irn = 0.0;
    n_tot = 0.0;

    constructor() {
        this.clearAll();
        this.buttonEventListener();
    }

    buildNumber(num) {
        if (this.s_expression.includes('=') && this.s_number[0] !== '0') {
            this.s_number = '0';
            this.s_expression = '';
        }
        if (this.s_number[0] === 'T') this.s_number = '';
        if (this.s_number.includes('.') && num === '.') return;
        if (this.s_number[0] === '0' && this.s_number[1] !== '.') this.s_number = '';
        this.s_number += num;
        if (this.s_number[0] === '.') this.s_number = "0.";
        this.show();
    }

    buildExpression(op) {
        if (/=/.test(this.s_expression)) this.s_expression = '';
        if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(this.s_number)) this.s_expression += (this.s_number + ' ');
        this.s_expression += (op + ' ');
        this.s_number = '0';
        this.show();
    }

    #calculatePresentValue() {
        if ((this.n_fv > 0.0 || this.n_pn > 0.0) && this.i_n > 0 && this.n_irn > 0.0 && this.n_pv >= 0.0) {
            this.n_pv = (this.n_fv - this.n_pn * (1 + this.n_irn) * ((1 - Math.pow((1 + this.n_irn), this.i_n)) / this.n_irn)) / Math.pow((1 + this.n_irn), this.i_n);
            if (this.n_pv < 0) return;
            this.e_pv.innerText = "PV: " + this.round(this.n_pv);
            this.s_number = 'The present value is: ' + this.round(this.n_pv, 5);
            this.n_tot = this.n_fv + this.n_pn * this.i_n;
            this.e_tot.innerText = "Total: " + this.round(this.n_tot);
        } else return;
    }
    #calculateFutureValue() {
        if ((this.n_pv > 0.0 || this.n_pn > 0.0) && this.i_n > 0 && this.n_irn > 0.0 && this.n_fv >= 0.0) {
            this.n_fv = this.n_pv * Math.pow((1 + this.n_irn), this.i_n) + this.n_pn * ((Math.pow((1 + this.n_irn), this.i_n) - 1) / this.n_irn);
            if (this.n_fv < 0) return;
            this.e_fv.innerText = "FV: " + this.round(this.n_fv);
            this.s_number = 'The future value is: ' + this.round(this.n_fv, 5);
            this.n_tot = this.n_pv + this.n_pn * this.i_n;
            this.e_tot.innerText = "Total: " + this.round(this.n_tot);
        } else return;
    }
    #calculateNumberOfPeriods() {
        if ((this.n_pv > 0.0 || this.n_pn > 0.0) && (this.n_fv > 0.0 || this.n_pn > 0.0) && this.n_irn > 0 && this.i_n >= 0) {
            this.i_n = Math.log((this.n_fv * this.n_irn + this.n_pn) / (this.n_pn + this.n_pv * this.n_irn)) / Math.log(1 + this.n_irn);
            if (this.i_n < 0) return;
            this.e_n.innerText = "n: " + this.i_n;
            this.s_number = 'The number of periods is approximately: ' + Math.round(this.i_n);
            this.n_tot = this.n_pv + this.n_pn * this.i_n;
            this.e_tot.innerText = "Total: " + this.round(this.n_tot);
        } else return;
    }
    #calculateInterestRate() {
        if ((this.n_pv > 0.0 || this.n_pn > 0.0) && (this.n_fv > 0.0 || this.n_pn > 0.0) && this.i_n > 0 && this.n_irn >= 0.0) {
            let low = 0.0;
            let high = 1.0;
            let r = (low + high) / 2;
            let i = 0;
            const tolerance = 0.000001;
            const maxLoop = 1 / tolerance;
            while (Math.abs(this.n_fv - this.n_pv * Math.pow((1 + r), this.i_n) - this.n_pn * ((Math.pow((1 + r), this.i_n) - 1) / r)) > tolerance) {
                i++;
                if (this.n_fv > this.n_pv * Math.pow((1 + r), this.i_n) + this.n_pn * ((Math.pow((1 + r), this.i_n) - 1) / r)) {
                    low = r;
                } else {
                    high = r;
                }
                r = (low + high) / 2;
                if (i > maxLoop) {
                    console.log("Error: maxLoop reached r:" + r + " low:" + low + " high:" + high);
                    return;
                }
            }
            if (r < 0) return;
            this.n_irn = r;
            this.e_irn.innerText = "IR/n: " + this.round(this.n_irn);
            this.s_number = 'The interest rate is: ' + this.round(this.n_irn * 100, 5) + ' % / period.';
            this.n_tot = this.n_pv + this.n_pn * this.i_n;
            this.e_tot.innerText = "Total: " + this.round(this.n_tot);
        } else return;
    }

    #calculatePayPerPeriod() {
        if ((this.n_pv > 0.0 || this.n_fv > 0.0) && this.i_n > 0 && this.n_irn > 0 && this.n_pn >= 0.0) {
            let a = this.n_pv * this.n_irn * Math.pow((1 + this.n_irn), this.i_n);
            let b = Math.pow((1 + this.n_irn), this.i_n) - 1;
            this.n_pn = a / b;
            if (this.n_pn < 0) return;
            this.e_pn.innerText = "Pay/n: " + this.n_pn;
            this.s_number = 'The payment per period is: ' + this.round(this.n_pn, 5);
        } else return;
    }

    doFinanc(inner) {
        if (inner === 'PV') {
            if (this.s_number === '0' || this.s_number[0] === 'T') {
                this.#calculatePresentValue();
            } else if (parseFloat(this.s_number) >= 0.0) {
                this.n_pv = parseFloat(this.s_number);
                this.s_number = '0';
                this.e_pv.innerText = "PV: " + this.n_pv;
            } else return;
        }
        if (inner === 'FV') {
            if (this.s_number === '0' || this.s_number[0] === 'T') {
                this.#calculateFutureValue();
            } else if (parseFloat(this.s_number) >= 0.0) {
                this.n_fv = parseFloat(this.s_number);
                this.s_number = '0';
                this.e_fv.innerText = "FV: " + this.n_fv;
            } else return;
        }
        if (inner === 'n') {
            if (this.s_number === '0' || this.s_number[0] === 'T') {
                this.#calculateNumberOfPeriods();
            } else if (parseInt(this.s_number) >= 0) {
                this.i_n = parseInt(this.s_number);
                this.s_number = '0';
                this.e_n.innerText = "n: " + this.i_n;
            } else return;
        }
        if (inner === 'IR/n') {
            if (this.s_number === '0' || this.s_number[0] === 'T') {
                this.#calculateInterestRate();
            } else if (parseFloat(this.s_number) >= 0.0) {
                this.n_irn = parseFloat(this.s_number);
                this.s_number = '0';
                this.e_irn.innerText = "IR/n: " + this.n_irn;
            } else return;
        }
        if (inner === 'Pay/n') {
            if (this.s_number === '0' || this.s_number[0] === 'T') {
                this.#calculatePayPerPeriod();
            } else if (parseFloat(this.s_number) >= 0.0) {
                this.n_pn = parseFloat(this.s_number);
                this.s_number = '0';
                this.e_pn.innerText = "Pay/n: " + this.n_pn;
            } else return;
        }
        this.draw_canvas();
    }

    draw_canvas() {
        if (this.i_n > 0) {
            let canvas = document.getElementById("canvas");
            let data = [Math.round(this.n_pv)];
            for (let i = 0; i < this.i_n; i++)
                data.push(Math.round(this.n_pn));            
            if (this.n_fv > 0)
                data[this.i_n] = Math.round(this.n_fv + this.n_pn);
            canvas.width = canvas.width;
            draw(canvas, data);
            console.log(data);
            this.show();
        } else return;
    }

    equalPressed() {
        if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(this.s_number)) this.s_expression += (this.s_number + ' ');
        console.log(this.s_expression);
        this.s_number = eval(this.s_expression).toString();
        this.s_number = parseFloat(parseFloat(this.s_number).toPrecision(15)).toString();
        this.s_expression += '= ';
    }

    round(s_num, prec = 2) {
        return parseFloat(parseFloat(s_num).toPrecision(prec)).toString();
    }

    doCommand(com) {
        if (com === '=') this.equalPressed();
        if (com === 'AC') this.clearAll();
        if (com === 'DEL') this.delete();
        if (com === '+/-') this.changeSignal();
        this.show();
    }

    changeSignal() {
        this.s_number = (parseFloat(this.s_number) * -1).toString();
    }

    clearAll() {
        this.s_expression = '';
        this.s_number = '0';
        this.e_pv.innerText = 'PV:';
        this.e_fv.innerText = 'FV:';
        this.e_n.innerText = 'n:';
        this.e_irn.innerText = 'IR/n:';
        this.e_pn.innerText = 'Pay/n:';
        this.e_tot.innerText = 'Total:';
        this.n_pv = 0.0;
        this.n_fv = 0.0;
        this.i_n = 0;
        this.n_irn = 0.0;
        this.n_pn = 0.0;
        this.n_tot = 0.0;
        this.draw_canvas();
        return;
    }

    delete() {
        if (this.s_number !== '0') {
            this.s_number = this.s_number.slice(0, -1);
            if (this.s_number === '') this.s_number = '0';
            return;
        }
        if (this.s_expression !== '') this.s_expression = this.s_expression.slice(0, -2);

    }

    show() {
        this.e_expression.innerText = this.s_expression;
        this.e_number.innerText = this.s_number;
    }

    buttonEventListener() {
        document.querySelectorAll("[data-num]").forEach(button => {
            button.addEventListener('click', () => {
                this.buildNumber(button.textContent);
            })
        })
        document.querySelectorAll("[data-op]").forEach(button => {
            button.addEventListener('click', () => {
                this.buildExpression(button.textContent);
            })
        })
        document.querySelectorAll("[data-com]").forEach(button => {
            button.addEventListener('click', () => {
                this.doCommand(button.textContent);
            })
        })
        document.querySelectorAll("[data-fin]").forEach(button => {
            button.addEventListener('click', () => {
                this.doFinanc(button.textContent);
            })
        })
    }
}

const calc = new Calculator();

// // this function calculate the value of monthly payment as function of the other parameters
// function calculatePayment() {
//     let pv = document.getElementById("pv").value;
//     let fv = document.getElementById("fv").value;
//     let n = document.getElementById("n").value;
//     let irn = document.getElementById("irn").value;
//     let pn = document.getElementById("pn").value;

//     if (pv === '' || fv === '' || n === '' || irn === '' || pn === '') {
//         alert("Please fill all the fields!");
//         return;
//     }
//     if (pv < 0 || fv < 0 || n < 0 || irn < 0 || pn < 0) {
//         alert("Please enter positive values!");
//         return;
//     }
//     let payment = (pv * irn * Math.pow((1 + irn), n)) / (Math.pow((1 + irn), n) - 1) + pn;
//     document.getElementById("payment").value = payment.toFixed(2);
// }