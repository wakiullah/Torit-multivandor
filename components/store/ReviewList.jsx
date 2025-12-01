'use client'
import { StarIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

const ReviewList = ({ reviews }) => {
    const router = useRouter()

    return (
        <div>
            <h2>Total Reviews</h2>
            <div className="mt-5">
                {
                    reviews.map((review) => (
                        <div key={review._id} className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl">
                            <div>
                                <div className="flex gap-3">
                                    {/* <Image src={review.user.image} alt="" className="w-10 aspect-square rounded-full" width={100} height={100} /> */}
                                    <div>
                                        <p className="font-medium">{review.user.name}</p>
                                        <p className="font-light text-slate-500">{new Date(review.createdAt).toDateString()}</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-slate-500 max-w-xs leading-6">{review.comment}</p>
                            </div>
                            <div className="flex flex-col justify-between gap-6 sm:items-end">
                                <div className="flex flex-col sm:items-end">
                                    <div className='flex items-center'>
                                        {Array(5).fill('').map((_, index) => (
                                            <StarIcon key={index} size={17} className='text-transparent mt-0.5' fill={review.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                        ))}
                                    </div>
                                </div>
                                {/* <button onClick={() => router.push(`/product/${review.product.id}`)} className="bg-slate-100 px-5 py-2 hover:bg-slate-200 rounded transition-all">View Product</button> */}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default ReviewList