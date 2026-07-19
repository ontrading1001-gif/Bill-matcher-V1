export const metadata = {
  title: 'QuickBooks Matcher',
  description: 'Vendor Bill Matching System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc' }}>
        {children}
      </body>
    </html>
  )
}
