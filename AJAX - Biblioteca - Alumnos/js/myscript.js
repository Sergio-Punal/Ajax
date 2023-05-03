const $formulario = document.querySelector('form'),
      formulario=["nombre","apellidos","domicilio","poblacion","provincia","email"],
      $enviarBtn=$formulario["enviar"],
      $templateTabla=document.querySelector("#template-tabla").content
      $templateRow = document.querySelector("#template-row").content

function ajax(options){
    let {url,method,fExito,fError,data}=options

    fetch(url,{
        method:method||"GET",
        headers:{"Content-type":"application/json; charset=utf-8"},
        body:JSON.stringify(data)
    })
    .then(resp=>resp.ok?resp.json():Promise.reject(resp))
    .then(json=>fExito(json))
    .catch(error=>{
        let mensaje=error.statusText||"Ocurrió un error"
        fError({
            status:error.status,
            statusText:mensaje
        })
    })
}

function checkNIF(cadena){
    const exprReg=/^\d{8}-[a-z]{1}$/i
    return exprReg.test(cadena)
}

function rellenarDatosFormulario(datos) {
    formulario.forEach(nombre=>$formulario[nombre].value=datos[nombre])
}

function renderPrestamosSocio(prestamos) {
    //console.log(prestamos)
    $clonTabla=$templateTabla.cloneNode(true)
    tbody=$clonTabla.querySelector("tbody")
    prestamos.forEach(prestamo=>{
        $clonFila=$templateRow.cloneNode(true)
        $tds=$clonFila.querySelectorAll("td")
        $tds[0].textContent=prestamo.libro.titulo
        $tds[1].textContent=prestamo.libro.autor
        $tds[2].textContent=prestamo.libro.editorial
        $tds[3].textContent=prestamo.libro.genero
        $tds[4].textContent=prestamo.libro.paginas
        $tds[5].textContent=prestamo.libro.fechEdicion
        tbody.appendChild($clonFila)
    })
    $formulario.querySelectorAll("fieldset")[1].appendChild($clonTabla)
}

function buscarLibrosSocio(socioId) {
    ajax({
        url:`http://localhost:3000/prestamos?socioId=${socioId}&_expand=libro`,
        fExito:prestamos=>renderPrestamosSocio(prestamos),
        fError:error=>console.log(error)
    })
}

$formulario["nif"].addEventListener("blur",e=>{
    if (checkNIF($formulario["nif"].value)) {
        ajax({
            url:`http://localhost:3000/socios?nif=${$formulario["nif"].value}`,
            fExito:json=>{
                //console.log(json)
                if (json.length) {
                    rellenarDatosFormulario(json[0])
                    $enviarBtn.dataset.socioId=json[0].id
                    const boton=document.createElement("button")
                    boton.textContent="Ver libros prestados"
                    $formulario.querySelectorAll("fieldset")[1].appendChild(boton)
                    boton.addEventListener("click",e=>{
                        e.preventDefault()
                        const $tabla=$formulario.querySelectorAll("fieldset")[1].querySelector("table")
                        if ($tabla) {
                            boton.textContent="Ver libros prestados"
                            $tabla.remove()
                        }
                         else {
                            buscarLibrosSocio(json[0].id)
                            boton.textContent="Ocultar libros prestados"
                         }
                    })
                } else {
                    $enviarBtn.dataset.socioId=""
                }
            },
            fError:error=>console.log(error)
        })
    } else {
        alert("NIF incorrecto")
    }
})

$formulario.addEventListener("submit",e=>{
    e.preventDefault()
    const data={
        nif:$formulario["nif"].value,
        nombre:$formulario["nombre"].value,
        apellidos:$formulario["apellidos"].value,
        domicilio:$formulario["domicilio"].value,
        poblacion:$formulario["poblacion"].value,
        provincia:$formulario["provincia"].value,
        email:$formulario["email"].value
    }
    if ($enviarBtn.dataset.socioId) {
        //PUT
        console.log("PUT")
        if (formulario.every(name=>$formulario[name].value!="")) {
            ajax({
                url:`http://localhost:3000/socios/${$enviarBtn.dataset.socioId}`,
                method:"PUT",
                fExito:json=>location.reload(),
                fError:error=>console.log(error),
                data
            }) 
        } else {
            alert("Faltan datos por cubrir")
        }
    } else {
        //POST
        console.log("POST")
        if (formulario.every(name=>$formulario[name].value!="")) {
            ajax({
                url:`http://localhost:3000/socios/`,
                method:"POST",
                fExito:json=>location.reload(),
                fError:error=>console.log(error),
                data
            }) 
        } else {
            alert("Faltan datos por cubrir")
        }
    }
})