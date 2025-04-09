import logo from '@/assets/images/deephub_logo.png'
import { useSelector } from 'react-redux'

// ==============================|| CENTERED LOGO ||============================== //

const CenteredLogo = () => {
    const customization = useSelector((state) => state.customization)

    return (
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'center', pointerEvents: 'none' }}>
            <img style={{ objectFit: 'contain', height: 'auto', width: 300 }} src={logo} alt='DeepHub' />
        </div>
    )
}

export default CenteredLogo
