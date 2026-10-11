import React from 'react';
import { LESION_LABELS, type DentalHeader, type DentalRecord } from '@/lib/dentalRecord';

const VITAL_ROWS: Record<number, string> = {};
[2, 10, 18, 26].forEach((start) => {
  VITAL_ROWS[start] = 'Mạch: ______________________ lần/phút';
  VITAL_ROWS[start + 1] = 'Huyết áp: ___________________ mmHg';
  VITAL_ROWS[start + 2] = 'Nhiệt độ: ____________________ °C';
  VITAL_ROWS[start + 3] = 'Nhịp thở: ____________________ lần/phút';
});

function val(v?: string) {
  return v && String(v).trim() ? v : '';
}

function Head({ header }: { header: DentalHeader }) {
  return (
    <div className="dr-head">
      <div className="syte">{header.soYTe}</div>
      <div className="pk">{header.tenPhongKham}</div>
      <div className="tieude">{header.tieuDe1}</div>
      <div className="tieude">{header.tieuDe2}</div>
      <div className="khoa">{header.khoa}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="dr-row">
      <span className="lbl">{label} </span>
      {val(value)}
    </div>
  );
}

function DailyTable({ record }: { record: DentalRecord }) {
  return (
    <>
      <div className="dr-title">KẾ HOẠCH ĐIỀU TRỊ</div>
      <table className="dr-table">
        <thead>
          <tr>
            <th style={{ width: '12%' }}>NGÀY<br />GIỜ</th>
            <th style={{ width: '32%' }}>DIỄN BIẾN</th>
            <th style={{ width: '30%' }}>XỬ TRÍ</th>
            <th style={{ width: '12%' }}>KÝ TÊN</th>
            <th style={{ width: '14%' }}>GHI CHÚ</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 30 }).map((_, r) => {
            const vital = VITAL_ROWS[r] || '';
            return (
              <tr key={r}>
                <td>&nbsp;</td>
                <td>{vital ? <span className="dr-vital">{vital}</span> : '&nbsp;'}</td>
                <td>{r === 0 ? val(record.xuTri) || '&nbsp;' : '&nbsp;'}</td>
                <td>&nbsp;</td>
                <td>{r === 0 ? val(record.ghiChu) || '&nbsp;' : '&nbsp;'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function AdminBlock({ record }: { record: DentalRecord }) {
  return (
    <>
      <div className="dr-section">
        <div className="dr-section-title">I. HÀNH CHÍNH</div>
        <Row label="1. Số ngoại trú:" value={record.soNgoaiTru} />
        <Row label="2. Số lưu trữ:" value={record.soLuuTru} />
        <Row label="3. Họ và tên:" value={record.hoTen} />
        <Row label="4. Năm sinh:" value={record.namSinh} />
        <Row label="5. Tuổi:" value={record.tuoi} />
        <Row label="6. Giới tính:" value={record.gioiTinh} />
        <Row label="7. Dân tộc:" value={record.danToc} />
        <Row label="8. Ngoại kiều:" value={record.ngoaiKieu} />
        <Row label="9. Nghề nghiệp:" value={record.ngheNghiep} />
        <Row label="10. Địa chỉ:" value={record.diaChi} />
        <Row label="11. Nơi làm việc:" value={record.noiLamViec} />
        <Row label="12. BHYT đến:" value={record.bhytDen} />
        <Row label="13. Số thẻ BHYT:" value={record.soTheBHYT} />
        <Row label="14. Điện thoại:" value={record.dienThoai} />
        <Row label="15. Người nhà (báo tin):" value={record.nguoiNha} />
        <div className="dr-doi-tuong">
          <span>Đối tượng: BHYT <span className="dr-box" /> 2. Thu phí <span className="dr-box" /> 3. Miễn <span className="dr-box" /> 4. Khác <span className="dr-box" /></span>
        </div>
        <Row label="Đến khám lúc:" value={record.denKhamLuc} />
      </div>

      <div className="dr-section">
        <div className="dr-section-title">II. LÝ DO VÀO VIỆN</div>
        <div>{val(record.lyDo) || ' '}</div>
      </div>

      <div className="dr-section">
        <div className="dr-section-title">III. HỎI BỆNH</div>
        <Row label="Tiền sử bản thân:" value={record.tienSuBanThan} />
        <Row label="Tiền sử gia đình:" value={record.giaDinh} />
        <Row label="Quá trình bệnh lý:" value={record.quaTrinhBenhLy} />
      </div>

      <div className="dr-section">
        <div className="dr-section-title">IV. KHÁM</div>
        <Row label="Toàn thân:" value={record.toanThan} />
        <div className="dr-row">
          Mạch: {val(record.mach)} — Nhiệt độ: {val(record.nhietDo)} — Huyết áp: {val(record.huyetAp)} — Nhịp thở: {val(record.nhipTho)} — Cân nặng: {val(record.canNang)}
        </div>
        <Row label="Chẩn đoán:" value={record.chanDoan} />
        <Row label="Xử trí:" value={record.xuTri} />
      </div>
    </>
  );
}

export default function DentalRecord({ record, header, index, showFront = true, showBack = true, frontLast = false, backLast = false }: {
  record: DentalRecord;
  header: DentalHeader;
  index: number;
  showFront?: boolean;
  showBack?: boolean;
  frontLast?: boolean;
  backLast?: boolean;
}) {
  return (
    <>
      {/* FRONT */}
      <section className={`dr-sheet${showFront ? '' : ' dr-hidden'}${frontLast ? ' dr-no-break' : ''}`}>
        <Head header={header} />
        <div className="dr-grid">
          <div className="dr-half">
            <DailyTable record={record} />
          </div>
          <div className="dr-half">
            <AdminBlock record={record} />
          </div>
        </div>
        <div className="dr-page-no">Hồ sơ {index + 1} — Mặt trước</div>
      </section>

      {/* BACK */}
      <section className={`dr-sheet${showBack ? '' : ' dr-hidden'}${backLast ? ' dr-no-break' : ''}`}>
        <Head header={header} />
        <div className="dr-grid">
          <div className="dr-half">
            <div className="dr-section-title">3. HÌNH VẼ MÔ TẢ TỔN THƯƠNG</div>
            <div className="dr-lesion-grid">
              {LESION_LABELS.map((label) => (
                <div key={label}>
                  <div className="dr-lesion-box">(hình vẽ)</div>
                  <div className="dr-lesion-label">{label}</div>
                </div>
              ))}
            </div>
            <div className="dr-section" style={{ marginTop: '2mm' }}>
              <Row label="4. Tóm tắt bệnh án:" value={record.quaTrinhBenhLy} />
            </div>
            <div className="dr-section">
              <Row label="5. Chẩn đoán:" value={record.chanDoan} />
            </div>
            <div className="dr-section">
              <Row label="6. Xử lý tuyến dưới:" value={record.chanDoanNoiGioiThieu} />
            </div>
            <div className="dr-section">
              <Row label="7. Điều trị ngoại trú:" value={record.xuTri} />
            </div>
            <div className="dr-sign">
              <div>
                <div className="role">{header.giamDocPhongKham}</div>
                <div className="space" />
                <div>{val(record.namKy) || ''}</div>
              </div>
              <div>
                <div className="role">{header.bacSyKhamBenh}</div>
                <div className="space" />
                <div />
              </div>
            </div>
          </div>
          <div className="dr-half">
            <div className="dr-section-title">TỔNG KẾT BỆNH ÁN</div>
            <div className="dr-section">
              <Row label="1. Lý do vào viện:" value={record.lyDo} />
              <Row label="2. Quá trình bệnh lý:" value={record.quaTrinhBenhLy} />
              <Row label="3. Tiền sử:" value={record.tienSuBanThan} />
              <Row label="4. Khám toàn thân:" value={record.toanThan} />
              <Row label="5. Chẩn đoán:" value={record.chanDoan} />
              <Row label="6. Xử trí và điều trị:" value={record.xuTri} />
              <Row label="Ghi chú:" value={record.ghiChu} />
            </div>
          </div>
        </div>
        <div className="dr-page-no">Hồ sơ {index + 1} — Mặt sau</div>
      </section>
    </>
  );
}
