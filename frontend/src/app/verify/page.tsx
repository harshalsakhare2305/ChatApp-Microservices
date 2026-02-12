import Loader from "@/src/components/Loader"
import Verifyotp from "@/src/components/verifyotp"
import { Suspense } from "react"
function VerifyPage() {

  

return (
  <Suspense fallback={<Loader/>}>
  <Verifyotp/>
</Suspense>
)
  
}

export default VerifyPage
 