[17:41, 27/06/2022] Juan Ipam: 1) Execute o script para gerar os tasks do jeito exato que você quer que sejam rodados (escala, etc)
[17:42, 27/06/2022] Juan Ipam: 2) Quanfo todas as tarefas estejam com o ícone ´Run´ em azul na aba de task, aperte F12 para entrar no modo de desenvolvedor do Chrome
[17:42, 27/06/2022] Juan Ipam: 3) Na opção ' Console' digite:
[17:43, 27/06/2022] Juan Ipam: runTasks1= function() {
    $$('.run-button' ,$$('ee-task-pane')[0].shadowRoot).forEach(function(e) {
         e.click();
    })
}
[17:43, 27/06/2022] Juan Ipam: runTasks2= function() {
    $$('ee-table-config-dialog, ee-image-config-dialog').forEach(function(e) {
    var eeDialog = $$('ee-dialog', e.shadowRoot)[0]
var paperDialog = $$('paper-dialog', eeDialog.shadowRoot)[0]
    $$('.ok-button', paperDialog)[0].click()
    })
}
[17:43, 27/06/2022] Juan Ipam: isso para definir as funções necessãrias
[17:43, 27/06/2022] Juan Ipam: depois digite:
[17:43, 27/06/2022] Juan Ipam: runTask1();
[17:43, 27/06/2022] Juan Ipam: e espere aparecer todas as janelas de confirmação
[17:44, 27/06/2022] Juan Ipam: finalmente digite:
[17:44, 27/06/2022] Juan Ipam: runTask2();
