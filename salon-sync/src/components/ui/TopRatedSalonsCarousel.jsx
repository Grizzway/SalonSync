// src/components/ui/TopRatedSalonsCarousel.jsx

import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";

export default function TopRatedSalonsCarousel({ topSalons }) {
  // Sort salons by rating in descending order
  const sortedSalons = [...topSalons].sort((a, b) => b.rating - a.rating);

  return (
    <div className="flex flex-col items-center w-full max-w-[1920px]">
      {sortedSalons.length > 0 ? (
        <Carousel opts={{ align: "start" }} className="w-full max-w-[1600px] px-4">
          <CarouselContent className="flex gap-2">
            {sortedSalons.map((salon, index) => (
              <CarouselItem key={index} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className="p-2 flex justify-center">
                  <Link href={`/salons/${salon.salonId}`}>
                    <Card className="w-[400px] h-[400px] flex justify-center items-center rounded-xl shadow-md bg-white overflow-hidden relative group">
                      <CardContent className="flex flex-col items-center justify-center w-full h-full">
                        {/* Logo section */}
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-6 bg-gray-200 flex justify-center items-center">
                          {salon.logo ? (
                            <img
                              src={salon.logo || "/images/placeholder-salon.jpg"}
                              alt={salon.businessName}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <img
                              src="/images/placeholder-salon.jpg"
                              alt="Placeholder"
                              className="object-cover w-full h-full"
                            />
                          )}
                        </div>

                        {/* Salon Name */}
                        <h3 className="text-2xl font-semibold text-gray-900">{salon.businessName}</h3>

                        {/* Rating */}
                        <p className="text-yellow-500 mt-4 text-lg">⭐ {salon.rating.toFixed(1)} ({salon.reviewCount} reviews)</p>

                        {/* Hover text */}
                        <div className="absolute inset-0 flex justify-center items-center text-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-2xl">Click to visit</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute top-0 left-0 right-0 flex justify-between px-4 py-2">
            <CarouselPrevious className="bg-gray-200 dark:bg-gray-700 rounded-full p-2 hover:bg-gray-300 transition-all" />
            <CarouselNext className="bg-gray-200 dark:bg-gray-700 rounded-full p-2 hover:bg-gray-300 transition-all" />
          </div>
        </Carousel>
      ) : (
        <p className="text-center text-gray-500">No top-rated salons available.</p>
      )}
    </div>
  );
}