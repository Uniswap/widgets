import { render, screen, fireEvent, act } from '@testing-library/react'
import user from "@testing-library/user-event";

import MaxSlippageSelect from './MaxSlippageSelect'
import SettingsDialog from './index'
import { useState } from 'react';
import Column from '../../Column'
import { BoundaryProvider } from '../../Popover'
import { Provider as I18nProvider } from 'i18n'
import Dialog from '../../Dialog';

describe('MaxSlippageSelect', () => {

    test('can accept decimal input', async () => {
        // render MaxSlippageSelect field
        const locale = 'en-US'
        const elem = render(
            <I18nProvider locale={locale}>
                <Dialog color="module">
                    <SettingsDialog />
                </Dialog>
            </I18nProvider>
        )

        console.log(elem)

        const decimalInput = await elem.findByTestId('slippage')
        act(() => {
            fireEvent.change(decimalInput, {target: {value: '1.5'}}) // user inputs 1.5 to text field
        })
        expect(decimalInput.nodeValue).toBe('1.5') // fixme: expect decimalInput value = 1.5
 
    })



})
