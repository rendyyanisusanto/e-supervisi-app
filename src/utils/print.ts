export const triggerPrint = () => {
  // Give DOM time to react to any print mode state changes
  setTimeout(() => {
    window.print();
  }, 300);
};

export const getPrintStyles = () => {
  // We can inject global print styles if necessary
  return `
    @media print {
      body * {
        visibility: hidden;
      }
      #print-area, #print-area * {
        visibility: visible;
      }
      #print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      @page {
        size: A4;
        margin: 1cm;
      }
    }
  `;
};
