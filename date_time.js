function date_time() {
//** date time **//
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    var monthNames = [ "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec." ];
    // Create a newDate() object
    var newDate = new Date();

    // Extract the current date from Date object
    newDate.setDate(newDate.getDate());


    $('#Weekday').html(dayNames[newDate.getDay()]);
    // Output the day, date, month and year
    $('#Date').html(monthNames[newDate.getMonth()] + ' ' + newDate.getDate() + ',' + ' ' + newDate.getFullYear());

    socket.on('time', function (data) {

        $('#remoteWeekday').html(dayNames[data.weekday]);
        $('#remoteDate').html(monthNames[data.month] + ' ' + data.day + ',' + ' ' + data.year);
        $("#remotemin").html(( data.min < 10 ? "0" : "" ) + data.min);
        $("#remotehours").html(( data.hour < 10 ? "0" : "" ) + data.hour);

    });


    setInterval(function () {
        // Create a newDate() object and extract the minutes of the current time on the visitor's
        var minutes = new Date().getMinutes();
        // Add a leading zero to the minutes value
        $("#min").html(( minutes < 10 ? "0" : "" ) + minutes);

        var hours = new Date().getHours();
        // Add a leading zero to the hours value
        $("#hours").html(( hours < 10 ? "0" : "" ) + hours);

        socket.emit('time', {
            'hour': hours,
            'min': minutes,
            'weekday': newDate.getDay(),
            'month': newDate.getMonth(),
            'day': newDate.getDate(),
            'year': newDate.getFullYear()
        });

    }, 1000);
}
