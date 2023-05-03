
const $formulario = document.querySelector('form'),
  formulario = ["nombre", "apellidos", "domicilio","poblacion","provincia","email"],
  $templateRow = document.querySelector('#template-row').textContent

  function ajx(options) {
    let {url,method, fExito,fError,data} = options

    fetch(url, {
      method:method || "GET"
    })
  }