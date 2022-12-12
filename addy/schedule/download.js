document.querySelector("#download").onclick = async () => {

    // Get user inputs
    const monthInput = document.querySelector('#month').value;
    const yearInput = document.querySelector('#year').value;

    // Fetch holiday data from 'https://canada-holidays.ca/api'
    const statHolidayDataBritishColumbia = await fetch(`https://canada-holidays.ca/api/v1/provinces/BC?year=${yearInput}&optional=false`)
        .then((response) => response.json())
        .then((response) => response.province.holidays)
        .catch((e) => alert(`ERROR: ${e}`))

    // Fetch birthday data from local json file
    const staffData = await fetch('./staff.json')
        .then((response) => response.json())
        .catch((e) => alert(`ERROR: ${e}`))

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Adeline Yiyi Chunk';
    workbook.lastModifiedBy = 'Adeline Yiyi Chunk';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // Add toddler program worksheet
    addScheduleWorksheet(
        workbook,
        'TODS',
        ['7:30 - 3:30', '8:15 - 4:15', '9:15 - 5:15', '10:00 - 6:00'],
        monthInput,
        yearInput,
        statHolidayDataBritishColumbia,
        staffData
    )

    // Add 3/5 program worksheet
    addScheduleWorksheet(
        workbook,
        '3 to 5s',
        ['7:30 - 3:30', '8:30 - 4:30', '9:00 - 5:00', '10:00 - 6:00'],
        monthInput,
        yearInput,
        statHolidayDataBritishColumbia,
        staffData
    )

    // Download Workbook
    workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
        saveAs(blob, `Schedule - ${monthInput} ${yearInput}.xlsx`);
    });

}

function addScheduleWorksheet(workbook, section, shifts, monthInput, yearInput, holidays, staffData) {

    // Create worksheet template
    const worksheet = workbook.addWorksheet(section, { views: [{ showGridLines: false }] });
    // Sunday - Saturday : 0 - 6
    worksheet.columns = [
        { key: 'shiftData' },
        { key: 1 },
        { key: 2 },
        { key: 3 },
        { key: 4 },
        { key: 5 }
    ];

    // Define date period
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const year = yearInput;
    const month = months.indexOf(monthInput);
    const numberOfDays = getNumberOfDays(year, month);
    function getNumberOfDays(year, month) {
        var isLeap = ((year % 4) == 0 && ((year % 100) != 0 || (year % 400) == 0));
        return [31, (isLeap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    // Create Header section content
    let headerBlock = [
        { shiftData: `${monthInput} ${yearInput}`, 5: section },
    ];
    worksheet.addRows(headerBlock);

    // Create shift section content
    let shiftBlock = (function () {
        let tempArray = [];
        tempArray.push(['']);
        tempArray.push(['SHIFT:']);
        for (let i = 0; i < shifts.length; i++) {
            tempArray.push([shifts[i]]);
        }
        tempArray.push(['Vacation:']);
        return tempArray;
    })();
    let iShiftBlockHeader = (function () {
        let tempArray = [];
        for (let i = 0; i < shiftBlock.length; i++) {
            tempArray.push(shiftBlock[i][0]);
        }
        return tempArray.indexOf('SHIFT:')
    })();
    let iVacationHeader = (function () {
        let tempArray = [];
        for (let i = 0; i < shiftBlock.length; i++) {
            tempArray.push(shiftBlock[i][0]);
        }
        return tempArray.indexOf('Vacation:')
    })();
    for (let day = 1; day <= numberOfDays; day++) {

        let date = new Date(year, month, day);
        let dayOfWeek = date.getDay();

        // Add day if it aligns with Monday - Friday
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            shiftBlock[iShiftBlockHeader][dayOfWeek] = `${day} ${date.toLocaleDateString('en-US', { weekday: 'long' })}`;
            // Check if day is a stat holiday
            let holidayName = getHoliday(date);
            if (holidayName) {
                shiftBlock[iVacationHeader][dayOfWeek] = holidayName;
            }
            // Check if birthdayAddys
            // let bdate = getDateUTC(new Date(`${year}-12-30`));
            // if (date.getTime() === bdate.getTime()) {
            //     shiftBlock[iVacationHeader][dayOfWeek] = 'Birthday Addys!';
            // }
        }

        // If friday -> Push section and reset array
        if (dayOfWeek === 5) {
            worksheet.addRows(shiftBlock);
            shiftBlock[iShiftBlockHeader] = ['SHIFT:'];
            shiftBlock[iVacationHeader] = ['Vacation:'];

            // If last day of month AND day aligns with Monday - Friday -> Push section and reset array
        } else if (day === numberOfDays) {
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                worksheet.addRows(shiftBlock);
                shiftBlock[iShiftBlockHeader] = ['SHIFT:'];
                shiftBlock[iVacationHeader] = ['Vacation:'];
            }
        }

    }
    function getHoliday(date) {
        for (let j = 0; j < holidays.length; j++) {
            let holidayDate = new Date(holidays[j].observedDate);
            holidayDate = getDateUTC(holidayDate);
            if (date.getTime() === holidayDate.getTime()) {
                return holidays[j].nameEn;
            }
        }
        return false;
    }
    function getDateUTC(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }


    // Add Birthdays
    let birthdayRowLength = 0;
    let hasBirthdayHeader = false;
    for (let i = 0; i < staffData.staff.length; i++) {
        const staff = staffData.staff[i];
        if (staff.birthday_month === monthInput) {
            if (!hasBirthdayHeader) {
                let newRow = worksheet.addRows([{}, { shiftData: "Birthdays:" }]);
                birthdayRowLength += 2;

                hasBirthdayHeader = true;
            }
            worksheet.addRows([{ shiftData: `${staff.birthday_month} ${staff.birthday_day} - ${staff.name}` }]);
            birthdayRowLength++;
        }
    }


    // ========================== FORMAT GLOBAL WORKSHEET ATTRIBUTES ==========================

    // Worksheet boundaries
    const firstColumn = 1;
    const lastColumn = 6;

    // Format Column widths
    // Constant offset amount required to get correct column width on download
    // https://github.com/exceljs/exceljs/issues/744
    // https://answers.microsoft.com/en-us/msoffice/forum/all/excel-changing-the-column-width-automatically/1c2cc86d-9978-47ac-b6c5-f5afc1ea4a64
    const msBugOffsetAmt = 0.71;
    worksheet.columns = [
        { width: 12.5 + msBugOffsetAmt },
        { width: 14.7 + msBugOffsetAmt },
        { width: 14.7 + msBugOffsetAmt },
        { width: 14.7 + msBugOffsetAmt },
        { width: 14.7 + msBugOffsetAmt },
        { width: 14.7 + msBugOffsetAmt }
    ]

    // ========================== FORMAT HEADER SECTION ==========================
    const headerFirstRow = 1;
    const headerLastRow = 1;

    // Format header font
    for (let i = headerFirstRow; i <= headerLastRow; i++) {
        for (let j = firstColumn; j <= lastColumn; j++) {

            worksheet.getCell(i, j).font = {
                name: 'Calibri',
                color: { argb: 'FF000000' },
                size: 18,
                italic: false,
                bold: true
            }

        }
    }

    // Format header alignment
    worksheet.getCell(headerFirstRow, firstColumn).alignment = { wrapText: false, vertical: 'middle', horizontal: 'left' };
    worksheet.getCell(headerFirstRow, lastColumn).alignment = { wrapText: false, vertical: 'middle', horizontal: 'right' };


    // ========================== FORMAT SCHEDULE SECTION ==========================
    const shiftFirstRow = headerLastRow + 2;
    const shiftLastRow = worksheet.getColumn(1)['_worksheet']['_rows'].length - birthdayRowLength;

    // Format shift font/alignment
    for (let i = shiftFirstRow; i <= shiftLastRow; i++) {
        for (let j = firstColumn; j <= lastColumn; j++) {

            let firstCell = worksheet.getCell(i, firstColumn).value;
            worksheet.getCell(i, j).font = {
                name: 'Calibri',
                color: { argb: 'FF000000' },
                size: 12,
                italic: false,
                bold: false
            }

            if (firstCell === 'SHIFT:' || firstCell === 'Vacation:') {
                for (let j = firstColumn; j <= lastColumn; j++) {
                    worksheet.getCell(i, j).font = {
                        ...worksheet.getCell(i, j).font,
                        bold: true
                    }
                    worksheet.getCell(i, j).alignment = {
                        ...worksheet.getCell(i, j).alignment,
                        vertical: 'middle',
                        wrapText: true
                    }
                }
            }

        }
    }

    // Add grid lines to shift section
    for (let i = shiftFirstRow; i <= shiftLastRow; i++) {

        if (worksheet.getCell(i, 1).value) {

            for (let j = firstColumn; j <= lastColumn; j++) {

                worksheet.getCell(i, j).border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            }

        }
    }

    // Add borders to shift section
    for (let i = shiftFirstRow; i <= shiftLastRow; i++) {

        const leftBorderCell = worksheet.getCell(i, firstColumn);
        const rightBorderCell = worksheet.getCell(i, lastColumn);

        // Update left/right borders
        leftBorderCell.border = {
            ...leftBorderCell.border,
            left: { style: 'medium', color: { argb: 'FF000000' } }
        };
        rightBorderCell.border = {
            ...rightBorderCell.border,
            right: { style: 'medium', color: { argb: 'FF000000' } }
        };

        // Update top/bottom borders
        let firstCell = worksheet.getCell(i, firstColumn).value;
        if (firstCell === 'SHIFT:' || firstCell === 'Vacation:') {
            for (let j = firstColumn; j <= lastColumn; j++) {
                worksheet.getCell(i, j).border = {
                    ...worksheet.getCell(i, j).border,
                    top: { style: 'medium', color: { argb: 'FF000000' } },
                    bottom: { style: 'medium', color: { argb: 'FF000000' } }
                };
            }
        }

    }

    // Add background colors to shift section
    for (let i = shiftFirstRow; i <= shiftLastRow; i++) {

        let firstCell = worksheet.getCell(i, 1).value;
        if (firstCell === 'SHIFT:' || firstCell === 'Vacation:') {

            for (let j = firstColumn; j <= lastColumn; j++) {
                worksheet.getCell(i, j).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFD9D9D9' },
                    bgColor: { argb: 'FF0000FF' }
                }
            }

        }

    }

    // ========================== FORMAT BIRTHDAY SECTION ==========================
    if (birthdayRowLength) {

        const birthdayFirstRow = shiftLastRow + 2;
        const birthdayLastRow = birthdayFirstRow + birthdayRowLength;

        // Format Birthday Section top row of content
        for (let j = firstColumn; j <= lastColumn; j++) {

            worksheet.getCell(birthdayFirstRow, j).font = {
                name: 'Calibri',
                color: { argb: 'FF000000' },
                size: 12,
                italic: false,
                bold: true
            }

        }

        // Format Birthday Section date content
        for (let i = birthdayFirstRow + 1; i <= birthdayLastRow; i++) {
            for (let j = firstColumn; j <= lastColumn; j++) {

                worksheet.getCell(i, j).font = {
                    name: 'Calibri',
                    color: { argb: 'FF000000' },
                    size: 12,
                    italic: false,
                    bold: false
                }

            }
        }

    }

}

