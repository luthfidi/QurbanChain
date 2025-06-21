"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi"
import { QURBAN_MANAGER_ADDRESS, QURBAN_MANAGER_ABI, QURBAN_ANIMAL_ABI, QURBAN_ANIMAL_ADDRESS } from "@/constants/index";
import { waitForTransactionReceipt, readContract } from "@wagmi/core"
import toast from "react-hot-toast"
import { config } from '@/App';

interface Contributor {
  walletAddress: string
}

interface ContributorModalProps {
  totalContributors: number
  animal: number
  campaignId: bigint
  children: string | JSX.Element | JSX.Element[]
  refetch: () => void;
}

export default function ContributorModal({
  totalContributors = 4,
  animal,
  campaignId,
  children,
  refetch
}: ContributorModalProps) {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [isOpen, setIsOpen] = useState(false)
  const [contributors, setContributors] = useState<Contributor[]>(
    Array.from({ length: totalContributors * 2 }, () => ({
      walletAddress: "",
    })),
  )

  const assignCouponsToWarga = async () => {
    toast.loading(`waiting for assignment...`, {
      style: {
        background: "rgba(32, 0, 82, 0.95)",
        color: "#FBFAF9",
        border: "1px solid rgba(131, 110, 249, 0.3)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
    })

    try {
      let targetWarga = contributors.map((contributor: Contributor) => {
        let wallet = contributor.walletAddress as `0x${string}`
        return wallet
      });
  
      const result = await writeContractAsync({
        address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
        abi: QURBAN_MANAGER_ABI,
        functionName: "assignCouponsToWarga",
        args: [campaignId, targetWarga],
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("assign coupon...", {
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
      console.error("assign coupon:", error)
      toast.dismiss()
      toast.error("assign coupon failed. Please try again.", {
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

  const handleContributorChange = (index: number, field: keyof Contributor, value: string) => {
    const updatedContributors = [...contributors]
    updatedContributors[index][field] = value
    setContributors(updatedContributors)
  }

  const getTitle = () => {
    return animal == 1 ? "Qurban Sapi" : "Qurban Kambing" 
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">Daftar Wallet Warga</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-lg text-white text-center">
            <h3 className="font-bold text-lg">{getTitle()}</h3>
            <p className="text-sm opacity-90">Total Slot: {totalContributors}</p>
          </div>

          <div className="grid gap-4">
            {contributors.map((contributor, index) => (
              <Card key={index} className="border-2 border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3 gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="grid gap-3 w-full">
                      <div>
                        <Label htmlFor={`wallet-${index}`} className="text-sm font-medium">
                          Alamat Wallet
                        </Label>
                        <div className="relative mt-1">
                          <Wallet className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id={`wallet-${index}`}
                            placeholder="0x..."
                            value={contributor.walletAddress}
                            onChange={(e) => handleContributorChange(index, "walletAddress", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button
              onClick={assignCouponsToWarga}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Konfirmasi Bergabung
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
