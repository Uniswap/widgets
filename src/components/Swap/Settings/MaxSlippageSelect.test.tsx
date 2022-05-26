import { render, screen, fireEvent } from '@testing-library/react'
import user from "@testing-library/user-event";

import MaxSlippageSelect from './MaxSlippageSelect'
import SettingsDialog from './index'
import { useState } from 'react';
import Column from '../../Column'
import { BoundaryProvider } from '../../Popover'


describe('MaxSlippageSelect', () => {

    test('can accept decimal input', () => {
        // const [boundary, setBoundary] = useState<HTMLDivElement | null>(null)
        const elem = render(
          <Column gap={1} style={{ paddingTop: '1em' }} >
            <BoundaryProvider value={null}>
              <MaxSlippageSelect />
            </BoundaryProvider>
          </Column>
        )

        const decimalInput = elem.getByLabelText('max-slippage-field')
        fireEvent.change(decimalInput, {target: {value: '1.5'}})
        expect(decimalInput.nodeValue).toBe('1.5')
    })



})
