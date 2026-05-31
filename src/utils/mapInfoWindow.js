export const getInfoWindowContent = ({ id, title, category, address }) => {
  return `
    <div style="padding:15px; min-width:220px; background:white; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); position: relative;">
      <button onclick="window.dispatchEvent(new CustomEvent('close-info-window'))" style="position:absolute; top:5px; right:5px; background:none; border:none; font-size:18px; cursor:pointer; color:#999; line-height: 1;">&times;</button>
      <h4 style="margin:0 0 8px 0; font-size:16px; font-weight:bold; color:#333; cursor:pointer; padding-right: 20px;" onclick="window.dispatchEvent(new CustomEvent('open-place-detail', { detail: ${id} }))">
        ${title} <span style="font-size:12px; color:#888;">></span>
      </h4>
      <p style="margin:0 0 10px 0; font-size:13px; color:#666;">${category || address || "장소"}</p>

      <div style="display: flex; gap: 5px;">
        <button
          onclick="window.dispatchEvent(new CustomEvent('open-place-detail', { detail: ${id} }))"
          style="flex: 1; padding:6px 12px; background-color:#4a3a2a; color:white; border:none; border-radius:4px; font-weight:bold; font-size: 12px; cursor: pointer;"
        >
          상세보기
        </button>
      </div>
    </div>
  `;
};
