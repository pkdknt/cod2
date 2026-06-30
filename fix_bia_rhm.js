const fs = require('fs');
let code = fs.readFileSync('e:/cod2/Bia_benh_an_RHM_A3 290626.html', 'utf8');

const htmlSafeCode = 'const htmlSafe=s=>String(s||"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[m]));\nfunction soLuuTruHtml';

code = code.replace(/function soLuuTruHtml/g, htmlSafeCode);

code = code.replace(/<span class="soLuuTruText" style="font-size:25pt">\$\{v\}<\/span>/g, '<span class="soLuuTruText" style="font-size:25pt">${htmlSafe(v)}</span>');

code = code.replace(/\$\{dongPK1\}/g, '${htmlSafe(dongPK1)}');
code = code.replace(/\$\{dongPK2\}/g, '${htmlSafe(dongPK2)}');
code = code.replace(/\$\{dongPK3\}/g, '${htmlSafe(dongPK3)}');
code = code.replace(/\$\{r\.tenBenhAn\|\|d\.tenBenhAn\|\|'([^']+)'\}/g, '${htmlSafe(r.tenBenhAn||d.tenBenhAn||"$1")}');
code = code.replace(/\$\{r\.maVaoVien\|\|''\}/g, '${htmlSafe(r.maVaoVien)}');
code = code.replace(/\$\{r\.maBenhNhan\|\|''\}/g, '${htmlSafe(r.maBenhNhan)}');
code = code.replace(/\$\{r\.hoTen\|\|''\}/g, '${htmlSafe(r.hoTen)}');
code = code.replace(/\$\{r\.gioiTinh\|\|''\}/g, '${htmlSafe(r.gioiTinh)}');
code = code.replace(/\$\{r\.namSinh\|\|''\}/g, '${htmlSafe(r.namSinh)}');
code = code.replace(/\$\{r\.cccd\|\|''\}/g, '${htmlSafe(r.cccd)}');
code = code.replace(/\$\{r\.diaChi\|\|''\}/g, '${htmlSafe(r.diaChi)}');
code = code.replace(/\$\{r\.maBHYT\|\|''\}/g, '${htmlSafe(r.maBHYT)}');
code = code.replace(/\$\{r\.ngayVaoVien\|\|''\}/g, '${htmlSafe(r.ngayVaoVien)}');
code = code.replace(/\$\{r\.dienThoai\|\|''\}/g, '${htmlSafe(r.dienThoai)}');

fs.writeFileSync('e:/cod2/Bia_benh_an_RHM_A3 290626.html', code, 'utf8');
console.log('Done RHM');
