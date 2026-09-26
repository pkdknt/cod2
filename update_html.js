const fs = require('fs');

try {
  let html = fs.readFileSync('e:/cod2/htmltemp/Nhon_Tam_BHYT_Update.html', 'utf8');

  const newFieldsHtml = `
<div class="form-group"><label>Ngày biên lai</label><input class="field" type="date" id="fReceiptDate"></div>
<div class="form-group"><label>Số biên lai</label><input class="field" id="fReceiptNo"></div>
<div class="form-group"><label>Số tiền đóng</label><input class="field" type="number" id="fAmount"></div>
<div class="form-group"><label>Hỗ trợ thêm</label><input class="field" type="number" id="fSupport"></div>
<div class="form-group"><label>Số tháng</label><input class="field" type="number" id="fMonths"></div>
<div class="form-group"><label>Mã NV Thu</label><input class="field" id="fStaffCode"></div>
<div class="form-group"><label>Loại gia hạn</label><select class="field" id="fRenewType"><option value=""></option><option>Mua mới</option><option>Gia hạn</option></select></div>
<div class="form-group"><label>Trạng thái liên hệ</label><input class="field" id="fContactStatus"></div>
`;
  html = html.replace('<div class="form-group"><label>Ngày gọi / liên hệ</label>', newFieldsHtml + '<div class="form-group"><label>Ngày gọi / liên hệ</label>');

  const getFormStr = `fNote: $('fNote').value,
          receiptDate: $('fReceiptDate') ? $('fReceiptDate').value : "",
          receiptNo: $('fReceiptNo') ? $('fReceiptNo').value : "",
          amount: $('fAmount') ? $('fAmount').value : "",
          support: $('fSupport') ? $('fSupport').value : "",
          months: $('fMonths') ? $('fMonths').value : "",
          staffCode: $('fStaffCode') ? $('fStaffCode').value : "",
          renewType: $('fRenewType') ? $('fRenewType').value : "",
          contactStatus: $('fContactStatus') ? $('fContactStatus').value : ""`;

  html = html.replace(/fNote\s*:\s*\$\(\'fNote\'\)\.value|fNote\s*:\s*\$\(\"fNote\"\)\.value/, getFormStr);

  const setFormStr = `$('fNote').value = c.fNote || "";
    if($('fReceiptDate')) $('fReceiptDate').value = c.receiptDate || "";
    if($('fReceiptNo')) $('fReceiptNo').value = c.receiptNo || "";
    if($('fAmount')) $('fAmount').value = c.amount || "";
    if($('fSupport')) $('fSupport').value = c.support || "";
    if($('fMonths')) $('fMonths').value = c.months || "";
    if($('fStaffCode')) $('fStaffCode').value = c.staffCode || "";
    if($('fRenewType')) $('fRenewType').value = c.renewType || "";
    if($('fContactStatus')) $('fContactStatus').value = c.contactStatus || "";`;

  html = html.replace(/\$\(\'fNote\'\)\.value\s*=\s*c\.fNote\s*\|\|\s*\"\"|\$\(\"fNote\"\)\.value\s*=\s*c\.fNote\s*\|\|\s*\"\"/, setFormStr);

  fs.writeFileSync('e:/cod2/htmltemp/Nhon_Tam_BHYT_HeThong_Moi.html', html);
  console.log('Successfully updated HTML and saved to Nhon_Tam_BHYT_HeThong_Moi.html');
} catch(e) {
  console.error(e);
}
