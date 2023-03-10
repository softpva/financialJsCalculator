import draw from "./draw.js";


/*
TODO: 
*** Check if the inputs are valid and consistent values, embebed draw.js in this class, insert alerts?
*** Use toFixed() or toPrecision() and eliminate the round() method
*** Think about the meaning of Total value.
*** After n > x cavas must doesn't print individual values of pay/n.
*** If the required fields are empty, show a message to fill them in.
*** If the required fields are filled in, but the values are not valid, show a message to fill them in correctly.
*** Show on canvas the value on irn.
*** Change the criteria to turn zero the values of pv, fv, pmt, irn.
*/

class Calculator {
    e_expression = document.querySelector("[data-expression]");
    e_number = document.querySelector("[data-current]");
    e_pv = document.querySelector("[data-pv]");
    e_fv = document.querySelector("[data-fv]");
    e_n = document.querySelector("[data-n]");
    e_pmt = document.querySelector("[data-pmt]");
    e_irn = document.querySelector("[data-irn]");
    e_tot = document.querySelector("[data-tot]");
    s_expression = '';
    s_number = '0';
    n_pv = 0.0;
    n_fv = 0.0;
    i_n = 0;
    n_pmt = 0.0;
    n_irn = 0.0;
    n_tot = 0.0;

    constructor() {
        this.clearAll();
        this.buttonEventListener();
    }

    buildNumber(num) {
        // TODO: rethink this method (it's a mess and has a bug)
        if (this.s_expression.includes('=') && this.s_number[0] !== '0') {
            this.s_number = '0';
            this.s_expression = '';
        }
        if (this.s_expression[0] === 'T' && num === '.') {
            this.s_number = '.';
            this.s_expression = '';
            this.show();
            return;
        }
        if (this.s_number.includes('.') && num === '.') return;
        if (this.s_number[0] === '0' && this.s_number[1] !== '.') this.s_number = '';
        this.s_number += num;
        if (this.s_number[0] === '.') this.s_number = "0.";
        this.show();
    }

    buildExpression(op) {
        if (/=|T/.test(this.s_expression)) this.s_expression = '';
        if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(this.s_number)) this.s_expression += (this.s_number + ' ');
        this.s_expression += (op + ' ');
        this.s_number = '0';
        this.show();
    }

    n_a() {
        return Math.pow((1 + this.n_irn), this.i_n);
    }
    n_b() {
        return (this.n_a() - 1) / this.n_irn;
    }
    n_c() {
        return (1 - 1 / this.n_a()) / this.n_irn;
    }
    calculatePresentValue() {
        if ((this.n_fv > 0.0 || this.n_pmt > 0.0) && this.i_n > 0 && this.n_irn > 0.0 && this.n_pv >= 0.0) {
            if (this.s_number === '.') this.pv = 0.0;
            this.n_pv = this.n_fv / this.n_a() + this.n_pmt * this.n_c();
            if (this.n_pv < 0) return;
            this.e_pv.innerText = "PV: " + this.round(this.n_pv);
            this.s_expression = 'The present value is:';
            this.s_number = this.round(this.n_pv, 5);
            this.n_tot = this.n_fv + this.n_pmt * this.i_n;
            this.e_tot.innerText = "Total: " + this.round(this.n_tot);
        }
    }
    calculateFutureValue() {
        if ((this.n_pv > 0.0 || this.n_pmt > 0.0) && this.i_n > 0 && this.n_irn > 0.0 && this.n_fv >= 0.0) {
            this.n_fv = this.n_pv * this.n_a() + this.n_pmt * this.n_b();
            if (this.n_fv < 0) return;
            this.e_fv.innerText = "FV: " + this.round(this.n_fv);
            this.s_expression = 'The future value is:';
            this.s_number = this.round(this.n_fv, 5);
            this.n_tot = this.n_pv + this.n_pmt * this.i_n;
            this.e_tot.innerText = "Total: " + this.round(this.n_tot);
        } else {
            this.n_fv = 0.0;
            return;
        }
    }
    calculateNumberOfPeriods() {
        if ((this.n_pv > 0.0 || this.n_pmt > 0.0) && (this.n_fv > 0.0 || this.n_pmt > 0.0) && this.n_irn > 0) {
            this.i_n = Math.log((this.n_fv * this.n_irn + this.n_pmt) / (this.n_pmt + this.n_pv * this.n_irn)) / Math.log(1 + this.n_irn);
            if (this.n_fv === 0) this.i_n *= -1;
            if (this.i_n < 0) return;
            this.e_n.innerText = "n: " + this.i_n;
            this.s_expression = 'The number of periods is approximately:';
            this.s_number = Math.round(this.i_n);
            this.n_tot = this.n_pv + this.n_pmt * this.i_n;
            this.e_tot.innerText = "Total: " + this.round(this.n_tot);
        }
    }
    // FIXME: this method has a bug when fv > 0, check it.
    calculateInterestRate() {
        if (this.n_pv > 0 && this.n_fv > 0 && this.i_n > 0 && this.n_pmt > 0) {
            // TODO: add other ifs to check data consistency
            // add msgs
            return;
        }
        if (this.n_pv > 0 && this.n_fv > 0 && this.i_n > 0 && this.n_pmt === 0) {
            this.n_irn = Math.pow((this.n_fv / this.n_pv), (1 / this.i_n)) - 1;
        }
        if ((this.n_pv > 0 || this.n_fv > 0) && this.i_n > 0 && this.n_pmt > 0) {
            const irnInc = 0.0001;
            let n_calc = 0.0;
            let i = 0;
            if (this.n_pv > 0) {
                n_calc = this.n_pmt * this.i_n;
                while (n_calc >= this.n_pv) {
                    this.n_irn += irnInc;
                    n_calc = this.n_pmt * (1 - 1 / Math.pow((1 + this.n_irn), this.i_n)) / this.n_irn;
                    i++;
                    if (i > 10000) {
                        // TODO: add msg
                        break;
                    }
                }
            }
            if (this.n_fv > 0) {
                n_calc = this.n_pmt * this.i_n;
                while (n_calc >= this.n_fv) {
                    this.n_irn += irnInc;
                    n_calc = this.n_pmt * ((Math.pow((1 + this.n_irn), this.i_n)) - 1) / this.n_irn;
                    i++;
                    if (i > 10000) {
                        // TODO: add msg
                        break;
                    }
                }
            }
        }
        this.e_irn.innerText = "IR/n: " + this.round(this.n_irn,8);
        this.s_expression = 'The interest rate is:';
        this.s_number = this.round(this.n_irn * 100, 5) + ' % / period.';
        this.n_tot = this.n_pv + this.n_pmt * this.i_n;
        this.e_tot.innerText = "Total: " + this.round(this.n_tot);
    }
    
    calculatePayPerPeriod() {
        if ((this.n_pv > 0.0 || this.n_fv > 0.0) && this.i_n > 0 && this.n_irn > 0 && this.n_pmt >= 0.0) {
            if (this.n_pv > 0.0 && this.n_fv > 0.0) {
                this.s_expression = 'The present value and the future value cannot be both greater than zero.';
                return;
            }
            if (this.n_fv === 0.0 && this.n_pv > 0.0) {
                let a = Math.pow((1 + this.n_irn), this.i_n);
                let c = (1 - 1 / a) / this.n_irn;
                this.n_pmt = this.n_pv / c;
                if (this.n_pmt < 0) return;
            }
            if (this.n_pv === 0.0 && this.n_fv > 0.0) {
                let a = Math.pow((1 + this.n_irn), this.i_n);
                let b = (a - 1) / this.n_irn;
                this.n_pmt = this.n_fv / b;
                if (this.n_pmt < 0) return;
            }
            this.e_pmt.innerText = "PMT: " + this.n_pmt;
            this.s_expression = 'The payment per period is:';
            this.s_number = this.round(this.n_pmt, 5);
        }
    }

    doFinanc(inner) {
        if (inner === 'PV') {
            if (this.s_number === '0' || this.s_expression[0] === 'T') {
                this.calculatePresentValue();
            } else if (parseFloat(this.s_number) >= 0.0) {
                this.n_pv = parseFloat(this.s_number);
                this.s_number = '0';
                this.e_pv.innerText = "PV: " + this.n_pv;
            } else return;
        }
        if (inner === 'FV') {
            if (this.s_number === '0' || this.s_expression[0] === 'T') {
                this.calculateFutureValue();
            } else if (parseFloat(this.s_number) >= 0.0) {
                this.n_fv = parseFloat(this.s_number);
                this.s_number = '0';
                this.e_fv.innerText = "FV: " + this.n_fv;
            } else return;
        }
        if (inner === 'n') {
            if (this.s_number === '0' || this.s_expression[0] === 'T') {
                this.calculateNumberOfPeriods();
            } else if (parseInt(this.s_number) >= 0) {
                this.i_n = parseInt(this.s_number);
                this.s_number = '0';
                this.e_n.innerText = "n: " + this.i_n;
            } else return;
        }
        if (inner === 'IR/n') {
            if (this.s_number === '0' || this.s_expression[0] === 'T') {
                this.calculateInterestRate();
            } else if (parseFloat(this.s_number) >= 0.0) {
                this.n_irn = parseFloat(this.s_number);
                this.s_number = '0';
                this.e_irn.innerText = "IR/n: " + this.n_irn;
            } else return;
        }
        if (inner === 'PMT') {
            if (this.s_number === '0' || this.s_number[0] === 'T') {
                this.calculatePayPerPeriod();
            } else if (parseFloat(this.s_number) >= 0.0) {
                this.n_pmt = parseFloat(this.s_number);
                this.s_number = '0';
                this.e_pmt.innerText = "PMT: " + this.n_pmt;
            } else return;
        }
        this.draw_canvas();
    }

    draw_canvas() {
        let canvas = document.getElementById("canvas");
        canvas.width = canvas.width;
        if (this.i_n > 0) {
            let data = [Math.round(this.n_pv)];
            for (let i = 0; i < this.i_n; i++)
                data.push(Math.round(this.n_pmt));
            if (this.n_fv > 0)
                data[this.i_n.toFixed(0)] = Math.round(this.n_fv + this.n_pmt);
            draw(canvas, data);
            console.log(data);
            this.show();
        }
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
        this.e_pmt.innerText = 'PMT:';
        this.e_tot.innerText = 'Total:';
        this.n_pv = 0.0;
        this.n_fv = 0.0;
        this.i_n = 0;
        this.n_irn = 0.0;
        this.n_pmt = 0.0;
        this.n_tot = 0.0;
        this.draw_canvas();
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

const n_calc = new Calculator();


// TODO: delete the functions below after test the class Calculator

// function that calculate the compound interest rate per period as function of the follow parameters: present value, future value, number of periods. Result OK
function calculateInterestRate2(n_pv, n_fv, i_n) {
    let irn = Math.pow((n_fv / n_pv), (1 / i_n)) - 1;
    return irn;
}

// function that calculate the compound interest rate per period as function of the follow parameters: present value, montly payment, number of periods. Ok 
function calculateInterestRate3(n_pv, n_pmt, i_n) {
    let pvCalc = n_pmt * i_n;
    let irn = 0;
    const irnInc = 0.0001;
    let i = 0;
    if (n_pv > pvCalc) {
        console.log("irn*n must be less than pv, irn must be greater than 0");
        return;
    }
    while (pvCalc >= n_pv) {
        irn += irnInc;
        if (i % 1000 === 0) console.log(i, pvCalc);
        pvCalc = n_pmt * (1 - 1 / Math.pow((1 + irn), i_n)) / irn;
        i++;
        if (i > 10000) {
            console.log("Loop exceded 10,000");
            irn = null;
            break;
        }
    }
    console.log(i, pvCalc, irn);
    return irn;
}
// function that calculate the compound interest rate per period as function of the follow parameters: future value, montly payment, number of periods. Ok
function calculateInterestRate4(n_fv, n_pmt, i_n) {
    let fvCalc = n_pmt * i_n;
    let irn = 0;
    const irnInc = 0.0001;
    let i = 0;
    if (n_fv < fvCalc) {
        console.log("irn*n must be less than fv, irn must be greater than 0");
        return;
    }
    while (fvCalc <= n_fv) {
        irn += irnInc;
        if (i % 1000 === 0) console.log(i, fvCalc);
        fvCalc = n_pmt * ((Math.pow((1 + irn), i_n)) - 1) / irn;
        i++;
        if (i > 10000) {
            console.log("Loop exceded 10,000");
            irn = null;
            break;
        }
    }
    console.log(i, fvCalc, irn);
    return irn;
}

// let irn = calculateInterestRate4(110, 10, 10);
// console.log(irn);
