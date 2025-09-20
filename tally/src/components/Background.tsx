export default function Background() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#444EAA]/5 via-white to-[#444EAA]/3"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(68,78,170,0.08)_0%,transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(68,78,170,0.04)_0%,transparent_50%)]"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#444EAA]/30 to-transparent"></div>
    </div>
  );
}