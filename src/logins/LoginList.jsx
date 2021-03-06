import React, { useState, useEffect } from 'react'
import '../App.css'
import LoginService from '../services/login'
import Login from './Login'
import LoginAdd from './LoginAdd'
import Message from '../Message'

const LoginList = () => {

    const [logins, setLogins] = useState([]) // tietotyyppi on taulukko
    const [lisäysTila, setLisäystila] = useState(false)

    const [showMessage, setShowMessage] = useState(false)
    const [isPositive, setIsPositive] = useState(false)
    const [message, setMessage] = useState('')

    ////////////// ADMIN TILATIETO ////////////////////////////
    const [admin, setAdmin] = useState(true)

    useEffect(() => {
        ////ADMIN TARKISTUS LOCAL STORAGESTA JA ASETUS STATEEN/////////
        const accesslevelId = localStorage.getItem('accesslevelId')
        if (accesslevelId == 1) {
            setAdmin(true)
        }
        else {
            setAdmin(false)
        }
        LoginService
            .getAll()
            .then(data => {
                setLogins(data)
            })
    }, [lisäysTila])


    // Tämä ajetaan kun ollaan poistamassa käyttäjää
    const handleDeleteClick = id => {

        //Kaivetaan esiin koko login olio jotta alertissa voidaan näyttää companyName id:n sijaan
        const login = logins.find(login => login.loginId === id)

        // Poiston varmistus kyselyikkuna
        const confirm = window.confirm(`Haluatko todella poistaa: ${login.username}:n pysyvästi?`)

        if (confirm) {

            LoginService.remove(id)
                .then(response => {

                    if (response.status === 200) {
                        // Poistetaan login statesta
                        setLogins(logins.filter(filtered => filtered.loginId !== id))

                        setMessage(`${login.username}:n poisto onnistui!`)
                        setIsPositive(true)
                        setShowMessage(true)
                        window.scrollBy(0, -10000) // Scrollataan ylös jotta nähdään alert :)

                        setTimeout(() => {
                            setShowMessage(false)
                        }, 4000
                        )
                    }

                })

                .catch(error => {
                    console.log(error)
                    setMessage(`Tapahtui virhe: ${error}`)
                    setIsPositive(false)
                    setShowMessage(true)

                    setTimeout(() => {
                        setShowMessage(false)
                    }, 7000
                    )
                })
        }
        else { // JOS KÄYTTÄJÄ EI VAHVISTANUT POISTOA:
            setMessage('Poisto peruutettu')
            setIsPositive(true)
            setShowMessage(true)

            setTimeout(() => {
                setShowMessage(false)
            }, 4000
            )
        }
    }

    //________________________________________________________________

    // RETURN ON AINA SE OSA JOKA RENDERÖIDÄÄN RUUDULLE
    // Tässä on käytetty osittain vähän erilaisia ehtolauserakenteita kuin Customereissa

    //////Jos ei ole adminkäyttäjä tulee aina tämä näkymä////////////
    if (!admin) {
        return (<h2>Sorry, this page is for admin users only</h2>)
    }

    // Jos logineja ei ole ehtinyt tulla kannasta stateen, mutta on adminkäyttäjä
    if (!lisäysTila && admin && logins.length === 0) {
        return (<>
            <h1><nobr> Logins</nobr>

                <button className="nappi" onClick={() => setLisäystila(true)}>Add new</button></h1>
            { showMessage &&
                <Message message={message} isPositive={isPositive} />
            }
            <p>Loading...</p>
        </>)
    }

    // Jos kirjautuneena on adminkäyttäjä ja statessa on jo kannasta saapuneet loginit ja lisäystilakin on pois päältä
    if (!lisäysTila && admin && logins) {
        return (
            <>
                <h1><nobr> Logins</nobr>

                    <button className="nappi" onClick={() => setLisäystila(true)}>Add new</button></h1>

                { showMessage &&
                    <Message message={message} isPositive={isPositive} />
                }

                <table className="loginsListTable">
                    <thead><tr>
                        <th>Username</th><th>Firstname</th><th>Lastname</th>
                        <th>Email</th><th></th>
                    </tr>
                    </thead >
                    <tbody>
                        {logins.map(login =>

                            <Login key={login.loginId} login={login}
                                handleDeleteClick={handleDeleteClick} />
                        )
                        }

                    </tbody>
                </table >
            </>

        )
    }

    if (lisäysTila && admin) {
        return (<>
            <h1>Logins</h1>
            { showMessage &&
                <Message message={message} isPositive={isPositive} />
            }
            <LoginAdd setLisäystila={setLisäystila} logins={logins} setLogins={setLogins} setMessage={setMessage} setShowMessage={setShowMessage}
                setIsPositive={setIsPositive} />
        </>
        )
    }


}
export default LoginList
