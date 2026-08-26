const SITE_URL = "https://www.kismetkrystle.com"

export default function BookSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: "Infinite Bloom: Evolving by Perspective",
    author: {
      "@type": "Person",
      name: "Kismet Krystle",
      url: SITE_URL,
      image: "https://res.cloudinary.com/dsoojlgg1/image/upload/v1765783633/Kismet_head_shot_wprdoh.jpg",
    },
    image: "https://res.cloudinary.com/dsoojlgg1/image/upload/v1779156322/book_at_angle-v2_bg-removed_aqt9d7.png",
    description:
      "A collection of 45 poems with 143 reflective insights exploring spirituality, growth, and human connection. Includes author-narrated audio.",
    publisher: {
      "@type": "Organization",
      name: "Kismet Krystle",
    },
    inLanguage: "en",
    bookFormat: "https://schema.org/Paperback",
    offers: [
      {
        "@type": "Offer",
        priceCurrency: "USD",
        price: "20.00",
        name: "Digital Flipbook",
        url: `${SITE_URL}/?pricing=open`,
      },
      {
        "@type": "Offer",
        priceCurrency: "USD",
        price: "33.00",
        name: "Physical Book",
        url: `${SITE_URL}/?pricing=open`,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
