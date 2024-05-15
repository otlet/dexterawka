---
weight: 19
title: "Kalkulator rozliczeń"
description: "Sprawdź jak wygląda przykładowe rozliczenie"
icon: "article"
draft: false
toc: true
---

<center><img src="https://evelstar.com/wp-content/uploads/2021/05/Zasob-3LOGO-WHITE.png" width="25%"></center>

<br><br>
<center>

> Jeżeli nie masz pewności jak wyglądają rozliczenia przez partnera flotowego, możesz tutaj sprawdzić. Kalkulator jest zrobiony pod obowiązujące prowizje i stawki ZUS  partnera flotowego [Evelstar](https://evelstar.com/)

<br>
<br>

<style>


         #calculator {
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        #results {
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            background-color: rgba(50,50,50, 1);
        }

        #calculator label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        #calculator input, #calculator select, #calculator button {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid;
            border-radius: 4px;
            font-size: 16px;
        }

        #calculator button {
            border: none;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .application {
            margin-bottom: 20px;
        }

        .application div {
            margin-bottom: 15px;
        }

        .student {
            display: none; /* ukryty element, zakładam, że zostanie użyty w kodzie JavaScript */
        }

        /* Jasny motyw */
        @media (prefers-color-scheme: light) {
            body {
                background-color: #f7f7f7;
                color: #333;
            }
            #calculator {
                background-color: #ffffff;
            }
            #calculator input, #calculator select {
                border-color: #ddd;
                background-color: #ffffff;
                color: #333;
            }
            #calculator button {
                background-color: #4CAF50;
                color: #ffffff;
            }
            #calculator button:hover {
                background-color: #45a049;
            }
        }

        /* Ciemny motyw */
        @media (prefers-color-scheme: dark) {
            #calculator {
                background-color: #1e1e1e;
            }
            #calculator input, #calculator select {
                border-color: #333;
                background-color: #2c2c2c;
                color: #e0e0e0;
            }
            #calculator button {
                background-color: #4CAF50;
                color: #ffffff;
            }
            #calculator button:hover {
                background-color: #45a049;
            }
        }
 </style>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const calculatorForm = document.getElementById("calculator");
    const addApplicationBtn = document.getElementById("addApplication");
    const applicationsContainer = document.getElementById("applications");
    const isStudentCheckbox = document.getElementById("isStudent");
    const zusOptions = document.getElementById("zusOptions");
    const resultsDiv = document.getElementById("results");
    const alertDiv = document.getElementById("alert");
    const costsDiv = document.getElementsByName("costsVal")[0];
    

    addApplicationBtn.addEventListener("click", () => {
        const newApplication = document.createElement("div");
        newApplication.classList.add("application");
        newApplication.innerHTML = `
        <div class="application">
        <div>
        <label for="brutto">Zarobiona kwota brutto z aplikacji:</label>
        <input type="number" name="brutto" step="0.01" required>
        </div>
        <div>
        <label for="appName" class="vattext">Jaka aplikacja?<label>
                    <select name="appName" id="applicationName" required>
                        <option value="Glovo">Glovo</option>
                        <option value="Wolt">Wolt</option>
                        <option value="Uber Eats">Uber Eats</option>
                        <option value="Bolt Food">Bolt Food</option>
                        <option value="Stuart">Stuart</option>
                        <option value="Szama Express">Szama Express</option>
                    </select>
        </div>
        </div>
        `;
        applicationsContainer.appendChild(newApplication);
    });

    isStudentCheckbox.addEventListener("change", () => {
        if (isStudentCheckbox.checked) {
            zusOptions.setAttribute("hidden", true);
        } else {
            zusOptions.removeAttribute("hidden");
        }
    });

    calculatorForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const bruttoInputs = calculatorForm.querySelectorAll('input[name="brutto"]');
        const zusValue = parseFloat(calculatorForm.querySelector("#zus").value);
      
        let totalBrutto = 0;
        let zus = 0;
        let prowizja = 0;
        let ryczalt = 0;
        let netto = 0;
        let vat = 0;
        let additionalCosts = 0;
        let vatCosts = parseFloat(costsDiv.value);
      
        const appSelects = applicationsContainer.querySelectorAll('select[name="appName"]');
        const appNames = [];
        appSelects.forEach((select) => {
          appNames.push(select.value);
        });
      
        bruttoInputs.forEach((input, index) => {
          const appName = appNames[index];
      
          if (appName === "Uber Eats" || appName === "Bolt Food") {
            vat += parseFloat(input.value) * 0.23 / 1.23;
          }
          if (appName === "Glovo") {
            additionalCosts = 4.92;
          }
      
          totalBrutto += parseFloat(input.value);
        });
      
        prowizja = bruttoInputs.length * 30;
      
        if (!isStudentCheckbox.checked) {
          zus = zusValue;
        }
      
        netto = totalBrutto - vat - prowizja - zus - additionalCosts;

          // Obliczanie ryczałtu
       if (!isStudentCheckbox.checked) {
           if (netto <= 0)
               ryczalt = 0;
            else if(zus==0)
                ryczalt = 0;
           else {
               if (vatCosts > 0) {
                   netto = netto - vatCosts;
               }
               ryczalt = netto * 0.085;
           }
           }
      
        const wynagrodzenieNetto = netto - ryczalt;
      
        resultsDiv.innerHTML = `
        <h2 style="color:green;"> Twoje rozliczenie: </h2> 

          <p>Suma zarobków brutto: ${totalBrutto.toFixed(2)} zł</p>
          <p>Odliczony podatek VAT: ${vat.toFixed(2)} zł</p>
          <p>Koszty aplikacji: ${additionalCosts.toFixed(2)} zł</p>
          <p>Prowizja za ${bruttoInputs.length} źródeł dochodu: ${prowizja.toFixed(2)} zł</p>
          <p>Składka ZUS: ${zus.toFixed(2)} zł - pobierana RAZ na MIESIĄC!</p>
          <p>Faktury: ${vatCosts.toFixed(2)} zł </p>
          <p>Ryczałt: ${ryczalt.toFixed(2)} zł - musisz go samodzielnie opłacić do urzędu skarbowego.</p>
          <p><strong>Wynagrodzenie netto: ${wynagrodzenieNetto.toFixed(2)} zł</strong></p>
        `;

        if (vatCosts > 0) {
            resultsDiv.innerHTML += '<p><strong>Twój podatek dochodowy jest niższy, ponieważ wpisałeś kwotę w poniesione koszta - w praktyce to oznacza, że gdy np. kupujesz klocki hamulcowe do roweru to należy wziąć fakturę VAT na spółkę Evelstar, wgrać ją do panelu i pomniejsza Ci to podatek do zapałaty</strong></p>';
            let without = (netto + vatCosts) * 0.085;
            resultsDiv.innerHTML += `<p>Bez tego zapłacił byś podatku: ${without.toFixed(2)} zł. </p>
            
            `;
        }

        if(wynagrodzenieNetto.toFixed(2) < 0){
            alertDiv.innerHTML = `<br>
            {{% alert context="danger" %}}

            W przypadku takiego rozliczenia pojawia się sytuacja kiedy twoje saldo jest na minusie. W takim wypadku przy następnym rozliczeniu ta kwota zostanie rozliczona. 
        
            <br>

           <strong>Dlatego zachęcamy aby ustawić sobie częstotliwość rozliczeń na miesięczne bądź NA ŻĄDANIE</strong>

            <br>

            Unikniemy wtedy sytuacji, że zawieziemy np. na Uberze dwa zamówienia i nie wystarczy na pokrycie prowizji partnera.

            {{% /alert %}}
            `
        }

      })})
</script>
 <main>
        <form id="calculator">
            <div id="applications">
                <div class="application">
                    <div class="application">
                    <div>
                    <label for="brutto">Zarobiona kwota brutto z aplikacji:</label>
                    <input type="number" name="brutto" step="0.01" required>
                    </div>
                    <div>
                    <label for="appName" class="vattext">Jaka aplikacja?<label>
                    <select name="appName" id="applicationName" required>
                        <option value="Glovo">Glovo</option>
                        <option value="Wolt">Wolt</option>
                        <option value="Uber Eats">Uber Eats</option>
                        <option value="Bolt Food">Bolt Food</option>
                        <option value="Stuart">Stuart</option>
                        <option value="Szama Express">Szama Express</option>
                    </select>
                    </div>
                    </div>
                </div>
            </div><br>
            <button type="button" id="addApplication">Dodaj kolejną aplikację</button>
            <div class="student" style="width: 50%;">
                <label for="isStudent" class="studentLabel"> </label>
                <input type="hidden" name="isStudent" id="isStudent">
            </div>
            <div id="zusOptions">
                <label for="zus">Wybierz składkę ZUS:</label>
                <select name="zus" id="zus">
                    <option value="0" disabled>------- Osoby powyżej 26 lat --------</option>
                    <option value="145.90">Osoba nigdzie nie pracująca bez rezygnacji z PPK - 145.90zł</option>
                    <option value="135.40">Osoba nigdzie nie pracująca po rezygnacji z PPK - 135.40zł</option>
                    <option value="56.00">Osoba pracująca</option>
                    <option value="0" disabled>------- Osoby PONIŻEJ 26 lat --------</option>
                    <option value="119.90">Osoba nigdzie nie pracująca bez rezygnacji z PPK - 119.90zł</option>
                    <option value="109.40">Osoba nigdzie nie pracująca po rezygnacji z PPK - 109.40zł</option>
                    <option value="27.00">Osoba pracująca - 27.00zł</option>
                    <option value="0.00">Student, uczeń - 0.00zł</option>
                </select>
            </div>
            <div id="costs">
            <label for="costs"><b>Poniesione koszta (np. paliwo, części eksploatacyjne)</b></label>
            <input type="number" name="costsVal" step="0.01" value="0" required>
            </div>
            <br>
            <button type="submit">Oblicz wynagrodzenie netto</button>
        </form>
<br>

  <div id="results">Uzupełnij informacje wyzej</div>

  <div id="alert"></div>

 </main>



   <div class="footer">

</div>
</center>