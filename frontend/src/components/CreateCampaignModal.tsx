"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAccount, useWriteContract } from "wagmi"
import { QURBAN_MANAGER_ADDRESS, QURBAN_MANAGER_ABI } from "@/constants/index";
import { waitForTransactionReceipt } from "@wagmi/core"
import toast from "react-hot-toast"
import { config } from "@/App"

interface CreateCampaignModalProps {
  children: JSX.Element
  refetch: () => void;
}

export default function CreateCampaignModal({ children, refetch }: CreateCampaignModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { writeContractAsync } = useWriteContract()
  const { address } = useAccount();

  const handleAnimalSelect = async (animal: "sapi" | "kambing") => {
    let tokenId = animal === "sapi" ? 1 : 2;
    await createCampaign(tokenId)
    setIsOpen(false)
  }

  const createCampaign = async (tokenId: number) => {
    toast.loading(`creating`, {
      style: {
        background: "rgba(32, 0, 82, 0.95)",
        color: "#FBFAF9",
        border: "1px solid rgba(131, 110, 249, 0.3)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
    })

    try {
      const result = await writeContractAsync({
        address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
        abi: QURBAN_MANAGER_ABI,
        functionName: "createCampaign",
        args: [BigInt(tokenId), BigInt(10)],
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("creating campaign...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      await waitForTransactionReceipt(config, {
        hash: result as `0x${string}`,
      })

      toast.dismiss()
      // Success toast will be handled by event listener
    } catch (error) {
      console.error("Create Campaign:", error)
      toast.dismiss()
      toast.error("Create Campaign failed. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } finally {
      refetch();
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">Pilih Jenis Hewan Qurban</DialogTitle>
          <p className="text-gray-600 text-center text-sm">
            Pilih jenis hewan untuk campaign qurban yang akan Anda buat
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Animal Selection Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {/* Sapi Button */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-green-500 group"
              onClick={() => handleAnimalSelect("sapi")}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl">🐄</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Sapi</h3>
                <p className="text-sm text-gray-600">Untuk 7 orang</p>
                <div className="mt-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full inline-block">
                  Rekomendasi
                </div>
              </CardContent>
            </Card>

            {/* Kambing Button */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-500 group"
              onClick={() => handleAnimalSelect("kambing")}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl">🐐</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Kambing</h3>
                <p className="text-sm text-gray-600">Untuk 1 orang</p>
                <div className="mt-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full inline-block">
                  Individual
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">ℹ️ Informasi:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Sapi dapat dibagi untuk maksimal 7 orang</li>
              <li>• Kambing untuk 1 orang saja</li>
              <li>• Semua hewan telah tersertifikasi halal</li>
              <li>• Campaign akan tercatat di blockchain</li>
            </ul>
          </div>

          {/* Cancel Button */}
          <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full">
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
