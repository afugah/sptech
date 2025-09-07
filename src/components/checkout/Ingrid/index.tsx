/* TODO */
/* eslint-disable */
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { useCheckout } from "@/src/context/checkoutContext"
import { useCart } from "@/src/context/cartContext"

import Loader from "@/src/components/ui/Loader"

type Props = {
  setStep: Dispatch<SetStateAction<string>>
}
export default function Ingrid({ setStep }: Props) {
  const { startIngridSession, ingridHtmlSnippet, syncIngridSession, setPostalCode, checkoutLoaded, postalCode } =
    useCheckout()
  const { store } = useCart()
  const [sessionStarted, setSessionStarted] = useState<boolean>(false)

  const widgetRef = useRef<HTMLDivElement>(null)

  const getLocale = () => {
    if (store.countryCode === "SE") return "sv-SE"
    return "nl-NL"
  }

  useEffect(() => {
    if (!ingridHtmlSnippet && checkoutLoaded) {
      setSessionStarted(false)
      startIngridSession(getLocale()).then(() => setSessionStarted(true))
    }
     
  }, [ingridHtmlSnippet, checkoutLoaded])

  useEffect(() => {
    if (ingridHtmlSnippet && widgetRef?.current) {
      widgetRef.current.innerHTML = ingridHtmlSnippet
      replaceScriptNode(document.getElementById("shipwallet-container"))
      if (sessionStarted) {
        setupListener()
      }
    }
     
  }, [ingridHtmlSnippet, widgetRef])

  const setupListener = () => {
    // @ts-ignore
    window._sw((api: any) => {
      api.on("data_changed", (data: any, meta: any) => {
        if (
          meta.price_changed ||
          meta.shipping_method_changed ||
          meta.delivery_type_changed ||
          meta.pickup_location_changed
        ) {
          if (data?.search_address?.postal_code && data?.search_address?.postal_code !== postalCode) {
            setPostalCode(data?.search_address?.postal_code)
          }
          syncIngridSession().then(() => setStep("payment"))

        }
      })
    })
  }

  const isScriptNode = (node: HTMLElement) => node.tagName === "SCRIPT"

  const isExternalScript = (node: HTMLElement) => {
    const scriptNode = node as HTMLScriptElement
    return !!scriptNode.src && scriptNode.src !== ""
  }

  const cloneScriptNode = (node: HTMLElement) => {
    const script = document.createElement("script")
    script.text = node.innerHTML
    for (let i = node.attributes.length - 1; i >= 0; i--) {
      script.setAttribute(node.attributes[i].name, node.attributes[i].value)
    }
    return script
  }

  const replaceScriptNode = (node: HTMLElement | null) => {
    if (!node) return
    if (isScriptNode(node) && !isExternalScript(node)) {
      if (node.parentNode) {
        node.parentNode.replaceChild(cloneScriptNode(node), node)
      }
    } else {
      let i = 0
      const children = node.childNodes
      while (i < children.length) {
        replaceScriptNode(children[i++] as HTMLElement)
      }
    }
    return node
  }

  return (
    <div>
      {!ingridHtmlSnippet || !widgetRef ? (
        <Loader inverted />
      ) : (
        <>
          <div ref={widgetRef} />
        </>
      )}
    </div>
  )
}
