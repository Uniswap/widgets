import { render, screen, fireEvent, act } from '@testing-library/react'
import user from "@testing-library/user-event";

import { tokens } from '@uniswap/default-token-list'
import MaxSlippageSelect from './MaxSlippageSelect'
import SettingsDialog from './index'
import { useState } from 'react';
import Column from '../../Column'
import { BoundaryProvider } from '../../Popover'
import { Provider as I18nProvider } from '../../../i18n'
import { SwapWidget } from '../../../index'
import Widget from '../../Widget'
import Dialog from '../../Dialog';
import Header from '../../Header';
import Settings from './index';
import { Trans } from '@lingui/macro'

describe('MaxSlippageSelect', () => {

    test('can accept decimal input', async () => {
        // render MaxSlippageSelect field
        const locale = 'en-US'
        const elem = render(
            // <SwapWidget tokenList={tokens} />

            // <I18nProvider locale={locale}>
            //     <Dialog color="module">
            //         <SettingsDialog />
            //     </Dialog>
            // </I18nProvider>

            <Widget tokenList={tokens}>
                <Header title={<Trans>Swap</Trans>}>
                    <Dialog color="module" onClose={() => console.log("close")}>
                        <SettingsDialog disabled={false} />
                    </Dialog>
                </Header>
            </Widget>
        )

        console.log(elem)
        // const wallet = await elem.findByTestId('wallet')

        const decimalInput = await elem.findByTestId('slippage')
        act(() => {
            fireEvent.change(decimalInput, {target: {value: '1.5'}}) // user inputs 1.5 to text field
        })
        expect(decimalInput.nodeValue).toBe('1.5') // fixme: expect decimalInput value = 1.5
 
    })



})
