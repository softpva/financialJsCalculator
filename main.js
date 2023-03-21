import draw from "./draw.js";


// TODO;  Eliminate comments
// TODO: Test aleatory values and conditions to check if the results are correct.

class Calculator {
    e_expression = document.querySelector("[data-expression]");
    e_number = document.querySelector("[data-current]");
    e_pv = document.querySelector("[data-pv]");
    e_fv = document.querySelector("[data-fv]");
    e_n = document.querySelector("[data-n]");
    e_pmt = document.querySelector("[data-pmt]");
    e_irn = document.querySelector("[data-irn]");
    e_pmtXn = document.querySelector("[data-pmtXn]");
    s_expression = '';
    s_number = '0';
    n_pv = 0.0;
    n_fv = 0.0;
    i_n = 0;
    n_pmt = 0.0;
    n_irn = 0.0;
    n_pmtXn = 0.0;

    constructor() {
        this.clearAll();
        this.buttonEventListener();
    }

    buildNumber(num) {

        if (this.s_expression.includes('=') && this.s_number[0] !== '0') {
            this.s_number = '0';
            this.s_expression = '';
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
        if ((this.n_fv > 0.0 || this.n_pmt > 0.0) && this.i_n > 0 && this.n_irn > 0.0 && this.n_pv === 0.0) {
            this.n_pv = this.n_fv / this.n_a() + this.n_pmt * this.n_c();
            this.e_pv.innerText = "PV: " + this.round(this.n_pv);
            this.s_expression = 'The present value is:';
            this.s_number = this.round(this.n_pv, 5);
            this.n_pmtXn = this.n_pmt * this.i_n;
            this.e_pmtXn.innerText = "PMT*n: " + this.round(this.n_pmtXn);
            this.draw_canvas();
            return;
        }
        this.e_expression.innerText = "The values are not consistent, check your values";
    }

    calculateFutureValue() {
        if ((this.n_pv > 0.0 || this.n_pmt > 0.0) && this.i_n > 0 && this.n_irn > 0.0 && this.n_fv === 0.0) {
            this.n_fv = this.n_pv * this.n_a() + this.n_pmt * this.n_b();
            if (this.n_fv < 0) return;
            this.e_fv.innerText = "FV: " + this.round(this.n_fv);
            this.s_expression = 'The future value is:';
            this.s_number = this.round(this.n_fv, 5);
            this.n_pmtXn = this.n_pmt * this.i_n;
            this.e_pmtXn.innerText = "PMT*n: " + this.round(this.n_pmtXn);
            this.draw_canvas();
            return;
        }
        this.e_expression.innerText = "The values are not consistent, check your values";
    }

    calculateNumberOfPeriods() {
        if ((this.n_pv > 0.0 || this.n_pmt > 0.0) && (this.n_fv > 0.0 || this.n_pmt > 0.0) && this.n_irn > 0) {
            this.i_n = Math.log((this.n_fv * this.n_irn + this.n_pmt) / (this.n_pmt + this.n_pv * this.n_irn)) / Math.log(1 + this.n_irn);
            if (this.n_fv === 0) this.i_n *= -1;
            if (this.i_n < 0) {
                this.e_expression.innerText = `The number of periods is negative: ${this.i_n}, check your values`;
                return;
            }
            this.e_n.innerText = "n: " + this.i_n;
            this.s_expression = 'The number of periods is approximately:';
            this.s_number = Math.round(this.i_n);
            this.n_pmtXn = this.n_pmt * this.i_n;
            this.e_pmtXn.innerText = "PMT*n: " + this.round(this.n_pmtXn);
            this.draw_canvas();
            return;
        }
        this.e_expression.innerText = "The values are not consistent, check your values";
    }

    calculateInterestRate() {
        if (this.n_pv > 0 && this.n_fv > 0 && this.i_n > 0 && this.n_pmt > 0) {
            this.s_expression = 'PV, FV, and PMT cannot be greater than zero at the same time';
            this.show();
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
                        this.s_expression = 'The number of iterations to calculate interest rate surpassed the limit of 10,000';
                        this.show();
                        break;
                    }
                }
            }
            if (this.n_fv > 0) {
                n_calc = this.n_pmt * this.i_n;
                while (n_calc <= this.n_fv) {
                    this.n_irn += irnInc;
                    n_calc = this.n_pmt * ((Math.pow((1 + this.n_irn), this.i_n)) - 1) / this.n_irn;
                    i++;
                    if (i > 10000) {
                        this.s_expression = 'The number of iterations to calculate interest rate surpassed the limit of 10,000';
                        this.show();
                        break;
                    }
                }
            }
            if (this.n_irn < 0) {
                this.s_expression = 'ATTENTION: The interest rate is negative, check your values';
                this.show();
            }
        }        
        this.s_expression = 'The interest rate is:';
        this.s_number = this.round(this.n_irn * 100, 5) + ' % / period.';
        this.n_pmtXn = this.n_pmt * this.i_n;
        this.e_irn.innerText = "IR/n: " + this.round(this.n_irn, 8);
        this.e_pmtXn.innerText = "PMT*n: " + this.round(this.n_pmtXn);
        this.show();
        this.draw_canvas();        
    }

    calculatePayPerPeriod() {
        if ((this.n_pv > 0.0 || this.n_fv > 0.0) && this.i_n > 0 && this.n_irn > 0 && this.n_pmt === 0.0) {
            if (this.n_pv > 0.0 && this.n_fv > 0.0) {
                this.s_expression = 'The present value and the future value cannot be both greater than zero.';
                this.show();
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
            this.e_pmt.innerText = "PMT: " + this.round(this.n_pmt, 9);
            this.s_expression = 'The payment per period is:';
            this.s_number = this.round(this.n_pmt, 5);
            this.n_pmtXn = this.n_pmt * this.i_n;
            this.e_pmtXn.innerText = "PMT*n: " + this.round(this.n_pmtXn);
            this.draw_canvas();
        }
    }

    doDblClick(inner) {
        if (inner === 'PV') {
            this.n_pv = 0.0;
            this.s_number = '0';
            this.s_expression = '';
            this.e_pv.innerText = "PV: " + this.n_pv;
            this.show();
            this.draw_canvas();
            return;
        }
        if (inner === 'FV') {
            this.n_fv = 0.0;
            this.s_number = '0';
            this.s_expression = '';
            this.e_fv.innerText = "FV: " + this.n_fv;
            this.show();
            this.draw_canvas();
            return;
        }
        if (inner === 'n') {
            this.i_n = 0;
            this.s_number = '0';
            this.s_expression = '';
            this.e_n.innerText = "n: " + this.i_n;
            this.show();
            this.draw_canvas();
            return;
        }
        if (inner === 'IR/n') {
            this.n_irn = 0.0;
            this.s_number = '0';
            this.s_expression = '';
            this.e_irn.innerText = "IR/n: " + this.n_irn;
            this.show();
            this.draw_canvas();
            return;
        }
        if (inner === 'PMT') {
            this.n_pmt = 0.0;
            this.n_pmtXn = 0.0;
            this.s_number = '0';
            this.s_expression = '';
            this.e_pmt.innerText = "PMT: " + this.n_pmt;
            this.e_pmtXn.innerText = "PMT*n: " + this.n_pmtXn;
            this.show();
            this.draw_canvas();
            return;
        }
    }

    doFinanc(inner) {
        if (inner === 'PV') {
            if (this.s_number === '0' && this.n_pv === 0) {
                this.calculatePresentValue();
                return;
            }
            if (parseFloat(this.s_number) > 0.0) {
                this.n_pv = parseFloat(this.s_number);
                this.s_number = '0';
                this.e_number.innerText = this.s_number;
                this.e_pv.innerText = "PV: " + this.n_pv;
                this.draw_canvas();
                return;
            }
            this.e_expression.innerText = 'The present value must be greater than zero.';
        }
        if (inner === 'FV') {
            if (this.s_number === '0' && this.n_fv === 0) {
                this.calculateFutureValue();
                return;
            }
            if (parseFloat(this.s_number) > 0.0) {
                this.n_fv = parseFloat(this.s_number);
                this.s_number = '0';
                this.e_number.innerText = this.s_number;
                this.e_fv.innerText = "FV: " + this.n_fv;
                this.draw_canvas();
                return;
            }
            this.e_expression.innerText = 'The future value must be greater than zero.';
        }
        if (inner === 'n') {
            if (this.s_number === '0' && this.i_n === 0) {
                this.calculateNumberOfPeriods();
                return;
            }
            if (parseInt(this.s_number) >= 0) {
                this.i_n = parseInt(this.s_number);
                this.s_number = '0';
                this.e_number.innerText = this.s_number;
                this.e_n.innerText = "n: " + this.i_n;
                this.draw_canvas();
                return;
            }
            this.e_expression.innerText = 'The number of time periods must be greater than zero.';
        }
        if (inner === 'IR/n') {
            if (this.s_number === '0' && this.n_irn === 0.0) {
                this.calculateInterestRate();
                return;
            }
            if (parseFloat(this.s_number) >= 0.0) {
                if (parseFloat(this.s_number) >= 1) {
                    this.n_irn = parseFloat(this.s_number) / 100;
                    this.s_expression = 'ATTENTION: The interest rate was divided by 100';
                } else {
                    this.n_irn = parseFloat(this.s_number);
                }
                this.s_number = '0';
                this.e_number.innerText = this.s_number;
                this.e_irn.innerText = "IR/n: " + this.n_irn;
                this.draw_canvas();
                return;
            }
            this.e_expression.innerText = 'The interest rate must be greater than zero.';
        }
        if (inner === 'PMT') {
            if (this.s_number === '0' && this.n_pmt === 0.0) {
                this.calculatePayPerPeriod();
                return;
            }
            if (parseFloat(this.s_number) >= 0.0) {
                this.n_pmt = parseFloat(this.s_number);
                this.s_number = '0';
                this.e_number.innerText = this.s_number;
                this.e_pmt.innerText = "PMT: " + this.n_pmt;
                this.e_pmtXn.innerText = "PMT*n: " + this.round(this.n_pmt * this.i_n);
                this.draw_canvas();
                return;
            }
            this.e_expression.innerText = 'The payment per period must be greater than zero.';
        }
        this.draw_canvas();
    }

    draw_canvas() {
        let canvas = document.getElementById("canvas");
        canvas.width = canvas.width;
        let n = Math.round(this.i_n);
        if (n > 0) {
            let data = [Math.round(this.n_pv)];
            for (let i = 0; i < n; i++)
                data.push(Math.round(this.n_pmt));
            if (this.n_fv > 0)
                data[n] = Math.round(this.n_fv + this.n_pmt);
            draw(canvas, data, (this.n_irn * 100).toFixed(2).toString());
            // console.log(data);
            this.show();
        }
    }

    equalPressed() {
        if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(this.s_number)) this.s_expression += (this.s_number + ' ');
        // console.log(this.s_expression);
        this.s_number = eval(this.s_expression).toString();
        this.s_number = parseFloat(parseFloat(this.s_number).toPrecision(15)).toString();
        this.s_expression += '= ';
    }

    round(s_num, prec = 6) {
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
        this.e_pmtXn.innerText = 'PMT*n:';
        this.n_pv = 0.0;
        this.n_fv = 0.0;
        this.i_n = 0;
        this.n_irn = 0.0;
        this.n_pmt = 0.0;
        this.n_pmtXn = 0.0;
        this.draw_canvas();
    }

    delete() {
        if (this.s_expression[0] === 'T' && this.s_number !== '0') {
            this.s_number = '0'
            this.s_expression = '';
            this.show();
            return;
        }
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
            button.addEventListener('dblclick', () => {
                this.doDblClick(button.textContent);
            })
        })
    }
}

const n_calc = new Calculator();