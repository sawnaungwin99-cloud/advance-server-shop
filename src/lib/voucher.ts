// Generates a PNG digital voucher in the browser (canvas renders Myanmar text natively).
export type VoucherData = {
  id: string;
  created_at: string;
  itemName: string;
  price: string;
  customerName?: string | null;
  phone?: string | null;
  ign?: string | null;
  username: string;
  password: string;
};

export async function downloadVoucher(d: VoucherData) {
  const W = 900;
  const H = 1180;
  const s = 2;
  const c = document.createElement("canvas");
  c.width = W * s;
  c.height = H * s;
  const x = c.getContext("2d")!;
  x.scale(s, s);
  const font = (w: number, px: number) =>
    `${w} ${px}px "Noto Sans Myanmar", "Padauk", "Myanmar Text", system-ui, sans-serif`;

  // background
  x.fillStyle = "#0b0f17";
  x.fillRect(0, 0, W, H);
  const g = x.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "#22d3ee");
  g.addColorStop(1, "#facc15");
  x.fillStyle = g;
  x.fillRect(0, 0, W, 10);

  // header
  x.textAlign = "center";
  x.fillStyle = "#facc15";
  x.font = font(800, 44);
  x.fillText("SNW ADVANCE SERVER SHOP", W / 2, 90);
  x.fillStyle = "#94a3b8";
  x.font = font(500, 20);
  x.fillText("Digital Voucher / ငွေလက်ခံဖြတ်ပိုင်း", W / 2, 128);

  // dashed divider
  const dash = (y: number) => {
    x.strokeStyle = "#334155";
    x.setLineDash([10, 8]);
    x.beginPath();
    x.moveTo(50, y);
    x.lineTo(W - 50, y);
    x.stroke();
    x.setLineDash([]);
  };
  dash(165);

  // order details
  x.textAlign = "left";
  x.fillStyle = "#22d3ee";
  x.font = font(700, 24);
  x.fillText("Order Details", 60, 215);
  const rows: [string, string][] = [
    ["Order ID", "#" + d.id.slice(0, 8).toUpperCase()],
    ["Date", new Date(d.created_at).toLocaleString()],
    ["Item", d.itemName],
    ["Price", d.price],
    ["Customer", d.customerName || "-"],
    ["Phone", d.phone || "-"],
    ["Game ID / IGN", d.ign || "-"],
    ["Status", "Completed / ပြီးစီးပြီ"],
  ];
  let y = 270;
  for (const [k, v] of rows) {
    x.fillStyle = "#94a3b8";
    x.font = font(500, 20);
    x.textAlign = "left";
    x.fillText(k, 60, y);
    x.fillStyle = "#f1f5f9";
    x.font = font(600, 21);
    x.textAlign = "right";
    let val = v;
    while (x.measureText(val).width > 520 && val.length > 4) val = val.slice(0, -2);
    if (val !== v) val += "…";
    x.fillText(val, W - 60, y);
    y += 52;
  }
  dash(y);

  // credentials box
  const by = y + 40;
  x.fillStyle = "rgba(250,204,21,0.08)";
  x.strokeStyle = "#facc15";
  x.lineWidth = 2;
  x.beginPath();
  x.roundRect(50, by, W - 100, 300, 20);
  x.fill();
  x.stroke();
  x.textAlign = "center";
  x.fillStyle = "#facc15";
  x.font = font(800, 26);
  x.fillText("Account Credentials", W / 2, by + 50);
  const cred = (label: string, val: string, cy: number) => {
    x.fillStyle = "#94a3b8";
    x.font = font(500, 19);
    x.fillText(label, W / 2, cy);
    x.fillStyle = "#ffffff";
    x.font = `700 30px ui-monospace, Menlo, monospace`;
    x.fillText(val, W / 2, cy + 42);
  };
  cred("Moonton Gmail", d.username, by + 105);
  cred("Moonton Password", d.password, by + 205);

  // footer
  x.fillStyle = "#64748b";
  x.font = font(500, 17);
  x.fillText("ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါသည်။ Telegram: t.me/ssnnww2025", W / 2, H - 50);

  const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/png"));
  if (!blob) throw new Error("Voucher generation failed");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SNW-Voucher-${d.id.slice(0, 8).toUpperCase()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
