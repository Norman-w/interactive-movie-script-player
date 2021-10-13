import React, { useState, useEffect } from "react";
// import "./header.css";

const formatData = (str) => {
    var newstr = new Date(str);
    var y = newstr.getFullYear();
    var m = newstr.getMonth() + 1;
    var d = newstr.getDate();
    var h = newstr.getHours();
    var min = newstr.getMinutes();
    var s = newstr.getSeconds();
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
};

function Header() {
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [time, setTime] = useState("");
    useEffect(() => {
        getTime();
    }, [time]);
    const getTime = () => {
        const timeID = setInterval(() => {
            setCurrentTime(Date.now());
            const result = formatData(currentTime);
            console.log(result);
            setTime(result);
            clearInterval(timeID);
        }, 1000);
    };

    return <div className="header">{time}</div>;
}

export default Header;
