/**
 * 数据生成 CSV 文件
 * @author Prk<code@imprk.me>
 */

const generateCSV = (
    data,
    headers = null,
    exclude = [],
    filename = 'download.csv'
) => {
    if (!data || !Array.isArray(data) || 0 === data.length) throw new Error('数据不能为空');

    const allFields = Object.keys(data[0]);
    const fields = allFields.filter(field => !exclude.includes(field));

    /**
     * Title
     * @author Prk<code@imprk.me>
     */
    let csvContent = '';
    const headerRow = fields.map(field => {
        const headerValue = headers && headers[field] ? headers[field] : field;
        return `"${String(headerValue).replace(/"/g, '""')}"`;
    }).join(',');

    csvContent += headerRow + '\r\n';
    data.forEach(item => {
        const row = fields.map(field => {
            const value = item[field] !== undefined ? item[field] : '';
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
        csvContent += row + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement('a');
        if (undefined !== link.download) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }
}

export default generateCSV;
