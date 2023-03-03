import { Box, Flex } from '@zoralabs/zord'
import { motion } from 'framer-motion'
import React from 'react'

import { Icon } from 'src/components/Icon'
import {
  artworkSettingsBox,
  artworkSettingsBoxDropping,
  artworkSettingsImageThumb,
  artworkSettingsName,
  artworkSettingsNameDropping,
  artworkSettingsPropertyCount,
  artworkSettingsPropertyName,
} from 'src/styles/Artwork.css'

import { useFormStore } from '../../stores'
import { ImageProps } from '../Artwork'

interface Trait {
  trait: string
  properties: string[]
  ipfs?: {}[]
}

export type OrderedTraits = Array<Trait>

export interface DragAndDropProps {
  draggedFrom?: number
  draggedTo?: number | null
  isDragging?: boolean
  originalOrder?: {
    trait: string
    properties: string[]
    ipfs?: {}[]
  }[]
  updatedOrder?: {
    trait: string
    properties: string[]
    ipfs?: {}[]
  }[]
}

interface SettingsBoxProps {
  trait: string
  properties: string[]
  ipfs: ImageProps[]
  setDragAndDrop: (props: DragAndDropProps) => void
  dragAndDrop: DragAndDropProps | null
  orderedLayers: OrderedTraits
  index: number
}

export const LayerBox: React.FC<SettingsBoxProps> = ({
  trait,
  properties,
  ipfs,
  setDragAndDrop,
  dragAndDrop,
  orderedLayers,
  index,
}) => {
  const { setOrderedLayers } = useFormStore()

  /*  toggle property animation  */
  const [isOpen, setIsOpen] = React.useState(false)
  const propertiesVariants = {
    initial: {
      height: 0,
      overflow: 'hidden',
    },
    open: {
      height: 'auto',
      overflow: 'scroll',
    },
  }

  /*

      Handle Drag and Drop to Reorder Properties

   */
  const onDragStart = (e: any) => {
    const initialPosition = Number(e.currentTarget.dataset.position)
    setDragAndDrop({
      ...dragAndDrop,

      draggedFrom: initialPosition,
      isDragging: true,
      originalOrder: orderedLayers,
    })

    /*  firefox compatibility */
    e.dataTransfer.setData('text/html', '')
  }

  const onDragOver = (e: any) => {
    e.preventDefault()

    let updatedOrder = orderedLayers

    const draggedFrom = dragAndDrop?.draggedFrom
    if (!draggedFrom && draggedFrom !== 0) return

    const draggedTo = Number(e.currentTarget.dataset.position)

    const itemDragged = updatedOrder[draggedFrom]

    const remainingItems = updatedOrder.filter(
      (item) => updatedOrder.indexOf(item) !== draggedFrom
    )

    updatedOrder = [
      ...remainingItems.slice(0, draggedTo),
      itemDragged,
      ...remainingItems.slice(draggedTo),
    ]

    if (draggedTo !== dragAndDrop?.draggedTo) {
      setDragAndDrop({
        ...dragAndDrop,
        updatedOrder,
        draggedTo,
      })
    }
  }

  const onDrop = () => {
    if (!dragAndDrop?.updatedOrder) return
    setOrderedLayers(dragAndDrop.updatedOrder)

    setDragAndDrop({
      ...dragAndDrop,
      draggedFrom: 0,
      draggedTo: null,
      isDragging: false,
    })
  }

  const getLayerName = (idx: number, layers?: OrderedTraits): string => {
    if (idx === 0) {
      return 'Top layer'
    }

    if (layers && idx === layers.length - 1) {
      return 'Base layer'
    }

    return `Layer #${idx}`
  }

  /*  listen for if section is being dropped in drop area */
  const isDropping = React.useMemo(() => {
    return dragAndDrop && dragAndDrop.draggedTo === Number(index)
  }, [dragAndDrop, index])

  /*  close section if is dragging */
  React.useEffect(() => {
    if (dragAndDrop?.isDragging) {
      setIsOpen(false)
    }
  }, [dragAndDrop])

  return (
    <Flex
      direction={'column'}
      key={trait}
      p={'x4'}
      mb={'x5'}
      className={isDropping ? artworkSettingsBoxDropping : artworkSettingsBox}
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-position={index}
    >
      <Flex
        fontSize={18}
        justify={isDropping ? 'center' : 'space-between'}
        align={'center'}
        className={isDropping ? artworkSettingsNameDropping : artworkSettingsName}
        onClick={() => setIsOpen((bool) => !bool)}
      >
        <Flex align={'center'}>
          <Box mr={'x2'}>
            {isDropping
              ? `Drag Here - Set as ${getLayerName(index, orderedLayers)}`
              : `${trait} (${properties?.length} variants)`}
          </Box>
          {!isDropping ? (
            isOpen ? (
              <Icon id="chevronUp" />
            ) : (
              <Icon id="chevronDown" />
            )
          ) : null}
        </Flex>
        {!isDropping && (
          <Flex align={'center'} fontSize={12}>
            <Box mr={'x4'}>{getLayerName(index, orderedLayers)}</Box>
            <Icon id="move" />
          </Flex>
        )}
      </Flex>
      <motion.div
        variants={propertiesVariants}
        initial={'initial'}
        animate={isOpen ? 'open' : 'initial'}
        style={{ maxHeight: '500px' }}
      >
        {properties?.map((property) => {
          const index = ipfs?.map((e) => e.name).indexOf(property)
          const image = ipfs?.[index]?.cid
          const src = ipfs?.[index]?.url
          return (
            <Flex gap={'x2'} key={property} justify={'center'} align={'center'}>
              <Flex
                align={'center'}
                fontSize={14}
                className={artworkSettingsPropertyName}
              >
                {property}
              </Flex>
              <Flex
                align={'center'}
                justify={'center'}
                className={artworkSettingsPropertyCount}
              >
                {ipfs && image && (
                  <img
                    src={src}
                    className={artworkSettingsImageThumb}
                    alt={`${property} thumbnail image`}
                  />
                )}
              </Flex>
            </Flex>
          )
        })}
      </motion.div>
    </Flex>
  )
}
