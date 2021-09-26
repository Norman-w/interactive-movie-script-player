class Utils {
    checkMobile = (mobile) => {
        let a = mobile;
        let isNum = /^\d+$/.test(a);

        if (isNum) {
            let firstNum = a[0];
            let firstCheck = parseInt(firstNum) === 1;
            let secondCheck = true;
            let lengthCheck = a.length <= 11;
            if (a.length > 1) {
                let secondNum = a[1];
                let secondNumInt = parseInt(secondNum)
                if (secondNumInt < 3) {
                    secondCheck = false;
                } else if (secondNumInt === 4) {
                    secondCheck = false;
                }
            }
            if (firstCheck && secondCheck && lengthCheck) {
                return a;
                // setMobile(e.target.value)
            }
        } else {

        }
    }
}
const utils=new Utils();
export default utils;