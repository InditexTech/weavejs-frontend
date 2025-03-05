
function OverlayOptionsSection({sectionTitle, children }: {sectionTitle?: string, children?: React.ReactNode}) {
  return (
    <div className="w-full font-body-m-light p-4 pb-2">
      <div className="text-sm font-medium mb-3">{sectionTitle}</div>
      {children}
    </div>
  );
}

export default OverlayOptionsSection;
