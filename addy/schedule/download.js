document.querySelector("#download").onclick = () => {

    // Get user inputs
    const monthInput = document.querySelector('#month').value;
    const yearInput = document.querySelector('#year').value;

    // Create workbook
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Adeline Yiyi Chunk';
    workbook.lastModifiedBy = 'Adeline Yiyi Chunk';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    createScheduleWorksheet(
        workbook,
        'TODS',
        ['7:30 - 3:30', '8:15 - 4:15', '9:15 - 5:15', '10:00 - 6:00'],
        monthInput,
        yearInput
    )

    createScheduleWorksheet(
        workbook,
        '3 to 5s',
        ['7:30 - 3:30', '8:30 - 4:30', '9:00 - 5:00', '10:00 - 6:00'],
        monthInput,
        yearInput

    )

    // Download Workbook
    workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
        saveAs(blob, `Schedule - ${monthInput} ${yearInput}.xlsx`);
    });

}

function createScheduleWorksheet(workbook, section, shifts, monthInput, yearInput) {

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
    let shiftBlock = [
        [],
        ['SHIFT:'],
        [shifts[0]],
        [shifts[1]],
        [shifts[2]],
        [shifts[3]],
        ['Vacation:']
    ];
    for (let day = 1; day <= numberOfDays; day++) {

        let date = new Date(year, month, day);
        let dayOfWeek = date.getDay();

        // Add day if it aligns with Monday - Friday
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            shiftBlock[1][dayOfWeek] = `${day} ${date.toLocaleDateString('en-US', { weekday: 'long' })}`;
        }

        // If friday OR last day of month -> Push section and reset array
        if (dayOfWeek === 5 || day === numberOfDays) {
            worksheet.addRows(shiftBlock);
            shiftBlock[1] = ['SHIFT:'];
        }

    }

    // FORMAT WORKSHEET

    // Worksheet boundaries
    const firstColumn = 1;
    const lastColumn = 6;
    let firstRow = 0;
    let lastRow = 0;

    // Format Column widths
    // Constant offset amount required to get correct column width on download
    // https://github.com/exceljs/exceljs/issues/744
    // https://answers.microsoft.com/en-us/msoffice/forum/all/excel-changing-the-column-width-automatically/1c2cc86d-9978-47ac-b6c5-f5afc1ea4a64
    const msBugOffsetAmt = 0.71;
    worksheet.columns = [
        { width: 13 + msBugOffsetAmt },
        { width: 14.5 + msBugOffsetAmt },
        { width: 14.5 + msBugOffsetAmt },
        { width: 14.5 + msBugOffsetAmt },
        { width: 14.5 + msBugOffsetAmt },
        { width: 14.5 + msBugOffsetAmt }
    ]

    // Header boundaries
    firstRow = 1;
    lastRow = 1;

    // Format header font
    for (let i = firstRow; i <= lastRow; i++) {
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
    worksheet.getCell(firstRow, firstColumn).alignment = { wrapText: false, vertical: 'middle', horizontal: 'left' };
    worksheet.getCell(firstRow, lastColumn).alignment = { wrapText: false, vertical: 'middle', horizontal: 'right' };

    // Shift boundaries
    firstRow = 3;
    lastRow = worksheet.getColumn(1)['_worksheet']['_rows'].length;

    // Format shift font
    for (let i = firstRow; i <= lastRow; i++) {
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
                }
            }

        }
    }

    // Add grid lines to shift section
    for (let i = firstRow; i <= lastRow; i++) {

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
    for (let i = firstRow; i <= lastRow; i++) {

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
    for (let i = firstRow; i <= lastRow; i++) {

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
}