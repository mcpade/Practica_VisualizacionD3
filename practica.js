//GRAFICA 1 - Crear un mapa con los barrios de la ciudad de Madrid y pintarlos por
//colores según el precio medio del alquiler en el barrio.

const tooltip = d3.select('#mapa')   
    .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


const width = 1000;
const height = 600;


color = ['#01A9DB', '#0174DF', '#013ADF', '#7401DF', 'black'];
const svg = d3.select('#mapa')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

//Leo los datos desde API --> JSON
const api = 'https://gist.githubusercontent.com/miguepiscy/2d431ec3bc101ef62ff8ddd0e476177f/raw/d9f3a11cfa08154c36623c1bf01537bb7b022491/practica.json';
d3.json(api)
.then ((madrid) => {  
   const projection = d3.geoMercator()
      .scale(height*120)  //zoom del mapa
      //.center([-3.703521, 40.417007])  //Coordenadas de sol para el punto central
      .center([-3.703521, 40.477007])  //He modificado un poco las coordenadas del punto central para que quede mejor centrado
      .translate([width/2, height/2]);
    
    const path = d3.geoPath().projection(projection);
    const features = madrid.features;
    //console.log(features)

    const  subunits = svg.selectAll('.subunits')
      .data(features)
      .enter()
      .append('path')
      .attr('class', 'subunits')
      
      //Acciones para el mouse. Quiero mostrar el nombre del barrio y el precio medio al pasar sobre él. También quiero que al hacer click se modifiquen las gráficas inferiores
      
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout)
      .on('click', mouseclick);


    subunits.attr('d', path)

    
    //Color: gama de azules
    
    //Algunos barrios no traen el precio medio, en ese caso los dejo en color negro
    subunits.attr('fill',(d) => {
        //console.log(d.properties.avgprice)
        
        return colorear (d)   //Función para colorear los barrios
        
    });

    //Leyenda de colores

    const legend = svg.selectAll(".legend")
    .data(color)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', (d,i)=>{
        coordx = width-200;
        coordy = i*22;
        return (`translate (${coordx}, ${coordy})`)

    });

    //Dibujo la leyenda de colores con rectángulos

    const ancho_rect = 20;
    const alto_rect = 20;
    legend.append('rect')
    .attr('x', 0)
    .attr('rx', 5) //Esquinas redondeadas
    .attr('width',ancho_rect)
    .attr('height',alto_rect)
    .style('fill', (d)=>d);    

     //Dibujo el texto de la leyenda
    const textos = ["Precio: 0 - 40 \u20AC", "Precio: 40 - 80 \u20AC", "Precio: 80 - 120 \u20AC", "Precio: > 120 \u20AC", "Precio: indefinido"]
    legend.append('text')
    .attr('x', (ancho_rect+2))
    .attr('y', (alto_rect-5))
    .text((d,i)=>{
         return (textos[i]);
    });

    //Acciones del mouse
    //Muestro el nombre del barrio cuando paso por encima de él

    function mouseover (){
        tooltip.transition()
          .duration(200)
          .style ('opacity', .9);
    }

    function mousemove(d) {
        tooltip .html(d.properties.name  + "<br />"  + "Precio:"+d.properties.avgprice +"\u20AC" )
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 50) + "px");

    }

    function mouseout(){
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
    }

    //Actualizo las gráficas inferiores
    function mouseclick(d) {
        barrioclick = d.properties.cartodb_id-1; //Empiezan en la posición 0, mientras que la cartodb_id empieza en 1
        grafica_habitaciones_propiedades (barrioclick);
        grafica_regresion_lineal(barrioclick);
     

    } 

   

    function colorear (d) {
     
        if (d.properties.avgprice<40) {
            return color[0];    
         } else if ((d.properties.avgprice>=40)&&(d.properties.avgprice<80)){
             return color[1];
         } else if ((d.properties.avgprice>=80)&&(d.properties.avgprice<120)){
             return color[2];
         } else if (d.properties.avgprice>120) {
             return color[3];
         } else {
             return color[4];
         }
    }

    /***********************************************************************************************************************************************/
    //Voy a definir una constantes comunes para los dos gráficos siguientes
    const width1 = 500;
    const height1 = 380;
    const sizeAxis = 40;
    const margen_inferior = 10;
    const ratio=5;
    const alturaY = height1-ratio-sizeAxis;
    const margen_texto = 60;
    const posxbarrio = 40;
    const posybarrio = 20;
    const margen_etiquetax = 200;
    const margen_ejey = 45;
    const margen_etiquetay=10;
    const espaciotrasbarrio=20;
   
   
    //GRAFICA 2: Crear una gráfica que en el eje Y tenga el número de propiedades
    // y en el eje X el número de habitaciones de un barrio.
    
    const anchura_barra = 40;

    
    svg2=d3.select('#graficahabitaciones')
    .append('svg');

    svg2  
     .attr('width', width1)
     .attr('height', height1);


    //Como entrada pinto la gráfica del primer barrio 
    grafica_habitaciones_propiedades (0);



    
    function grafica_habitaciones_propiedades (barrioclick) {
         const barrio = features[barrioclick]
         const rooms = barrio.properties.avgbedrooms
    
         if (rooms.length==0){  //Los barrios con precio indefinido no tienen datos. Al hacer click no hago nada
            return  
         } 
    
    
    
         svg2.selectAll('text')   //Borro los textos que pueda haber: las etiquetas de los ejes y el nombre del barrio
            .remove()       
            .exit()
    
        
             //console.log(rooms);

          //Monto las escalas
     
         const xmax = d3.max(rooms, d=>d.bedrooms);
         const xmin = d3.min(rooms, d=>d.bedrooms);  
         const ymax = d3.max(rooms, d=>d.total);
         const ymin = d3.min(rooms, d=>d.total);
    

         //Escala de X

         const scaleX = d3.scaleLinear () 
           .domain([-0.5,xmax])  //valor mínimo y máximo. El mínimo lo he puesto en -0.5 para separar el 0 del cruce y poder pintar la barra con su anchura 
           .range ([anchura_barra+6,width1-anchura_barra])   //entre que posiciones quiero que pinte


         //Escala Y
         const scaleY = d3.scaleLinear ()
           .domain([0,ymax])  //valor mínimo y máximo
           .range ([alturaY,margen_texto])   //entre que posiciones quiero que pinte. He dejado hueco para el texto
    


         const group = svg2   //Creo un grupo
           .selectAll('g')
           .remove()   //Borro por si hay datos anteriores
           .exit()
           .data(rooms)
           .enter()
           .append('g')
           .attr ('class', 'point'); 


         //Muevo cada elemento del grupo a sus coordenadas
         group.attr ('transform', (d,i)=>{
            const coordx = scaleX(d.bedrooms);
            const coordy = scaleY (d.total); 
            return `translate (${coordx}, ${coordy})`; 
         })    


         //Creo un rectángulo dentro del grupo
         const rect = group
            .append ('rect');

         //Dibujo las barras
         rect
            .attr('x',-(anchura_barra/2)) //Lo desplazo la mitad hacia la izquierda para que quede en el centro el tick del eje
            .attr('y',0)
            .attr('width',anchura_barra)
            .attr('height', d=>(height1-scaleY(d.total)-sizeAxis-ratio))
            .attr('stroke-width',1)
            .attr('stroke', 'black')
            .attr('fill',(d) => {    //Voy a usar el color que le corresponde por precio   
                 return colorear (barrio)       
             }); 

         //Creo ahora un texto dentro del grupo  
         const texto = group
            .append('text');

         //Voy a poner en texto la cantidad de viviendas
         texto
           .text (d => d.total)
           .attr('text-anchor', 'middle') //Para que el texto quede centrado con la barra       
           .attr('x',0)
           .attr('y',-2)
           .attr('class', 'titulo16');

    
         //Añado los ejes x e y

         //Eje x
    
         const formatAxis = d3.format('.0f');
    
         const xAxis = d3.axisBottom (scaleX);

         valores = Array.from ({length:(xmax+1)},(v,i) =>i); //Los valores que pinto en el eje x
    
         xAxis
           //.tickValues ([0,1,2,3,4])
           .tickValues (valores)
           .tickFormat (formatAxis);
    
    

         svg2.append ('g')
           .attr('class', 'axisX')
           .attr ('transform', `translate(0,${height1-sizeAxis-ratio})`) 
           .call (xAxis);  
           //El -sizeAxis es porque podemos ver que el g que crea tiene un ancho de 18 y por tanto lo restamos para poder verlo
           

         //Etiqueta para el eje x
   
         svg2.append('text')
            .attr('x', margen_etiquetax)
            .attr('y', height1-margen_inferior)
            .text("Numero de habitaciones")
            .attr('class', 'titulo14');


         //Eje Y

         const yAxis = d3.axisLeft(scaleY);
       
         svg2.append ('g')
            .attr ('class', 'axisY')
            .attr ('transform', `translate(${margen_ejey},0)`) 
            .call (yAxis);

          //Etiqueta para el eje y
         svg2.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -290)
            .attr('y', margen_etiquetay)
            .text("Numero de propiedades")
            .attr('class', 'titulo14');

         //Coloco arriba el nombre del barrio que deberá ir cambiando al dar al click

         svg2
            .append('text')
            .attr('x', posxbarrio)
            .attr('y', posybarrio)
            .text("Barrio: ")
            .attr('class', 'titulo14neg');
            
         svg2
            .append('text')
            .attr('x', posxbarrio)
            .attr('y', (posybarrio+espaciotrasbarrio))
            .text(barrio.properties.name)
            .attr('class', 'titulo20');

     
   } //final actualización gráfico 2

/**************************************************************************************************************************/

    //GRAFICA 3: Crear una gráfica que dibuje una regresión lineal 
    //de nº de habitaciones con respecto al precio en un barrio.
     const tooltip2 = d3.select('#graficaregresion')
       .append("div")
       .attr("class", "tooltip")
       .style("opacity", 0);

     //Primero dibujar la nube de puntos

     const svg3=d3.select('#graficaregresion')
        .append('svg');

     //Mismo tamaño que la otra gráfica
     svg3  
       .attr('width', width1)
       .attr('height', height1);

    //Como entrada pinto la gráfica del primer barrio 

     grafica_regresion_lineal(0);
   

     function grafica_regresion_lineal (barrioclick ) {

   
          const barrio2 = features[barrioclick] 
          const roomspriceorigen = barrio2.properties.properties   //nube de puntos

          if (roomspriceorigen.length==0){  //Los barrios con precio indefinido no tienen datos. Al hacer click no hago nada
             return  //No hago nada
          } 

          //He visto que en algunos barrios falta en algunos objetos la key bedrooms
          //y solo aparece price. Ejemplo: Barrio "Casco Históricode Vicálvaro", cartodb_id:14
          //Esto origina después errores a la hora de dibujar la nube de puntos
          //Antes de hacer nada voy a recorrer los objetos de properties y si me encuentro
          //uno que NO tenga las 2 keys no lo voy a tener en cuenta
   
          const roomsprice = [] //un array vacio
          for (let i in roomspriceorigen) {  //vamos recorriendo y me quedo solo con los que tengan dos valores
              if ((Object.keys(roomspriceorigen[i]).length) == 2) {
                   roomsprice.push({
                      bedrooms: roomspriceorigen[i].bedrooms,
                      price: roomspriceorigen[i].price
    
                   })   
                } 
    
            }
     
         svg3.selectAll('text')   //Borro los textos que pueda haber: las etiquetas de los ejes y el nombre del barrio
            .remove()       
            .exit()

          svg3.selectAll('line')   //Borro la recta de regresión
             .remove()
             .exit() 
    
          //Monto las escalas
 
         const xmax2 = d3.max(roomsprice, d=>d.bedrooms);
         const xmin2 = d3.min(roomsprice, d=>d.bedrooms);  
         const ymax2 = d3.max(roomsprice, d=>d.price);
         const ymin2 = d3.min(roomsprice, d=>d.price);


         //Escala x
         const scaleX2 = d3.scaleLinear ()
             .domain([0,xmax2])  //valor mínimo y máximo
             .range ([ratio+sizeAxis,width1-ratio])   //entre que posiciones quiero que pinte
             //Con el ratio sumando y restando consigo que no se corte el círculo
              //ya que la posición x,y es la del centro

  
         //Escala y
         const scaleY2 = d3.scaleLinear ()
             .domain([0,ymax2])  //valor mínimo y máximo
             .range ([alturaY,margen_texto])     
    
         const group2 = svg3   //Creo un grupo
             .selectAll('g')
             .remove()   //Borro por si hay datos anteriores
             .exit()
             .data(roomsprice)
             .enter()
             .append('g')
             .attr ('class', 'point'); 

         //Muevo cada elemento del grupo a sus coordenadas
         group2.attr ('transform', d=>{
             const coordx2 = scaleX2(d.bedrooms);
             const coordy2 = scaleY2(d.price);
             return `translate (${coordx2}, ${coordy2})`; 
          })   

         //Creo un círculo dentro del grupo
     
          const circle = group2
               .append ('circle');

          //Pinto los círculos
         circle
             .attr ('cx', d=>0)
             .attr ('cy', d=>0)
             .attr ('r',  d =>ratio)
             .attr('fill',(d) => {   //Uso el color que le corresponde por precio    
                  return colorear (barrio2)       
              }); 

          //Voy ahora con el eje x
         const formatAxis2 = d3.format('.0f');
         const xAxis2 = d3.axisBottom (scaleX2);

         valores2 = Array.from ({length:(xmax2+1)},(v,i) =>i); //Los valores que pinto en el eje x
         
         xAxis2
             //.tickValues ([0,1,2,3,4])
             .tickValues (valores2)
             .tickFormat(formatAxis2);

         svg3.append ('g')
             .attr('class', 'axisX')
             .attr ('transform', `translate(0,${height1-sizeAxis-ratio})`) 
             .call (xAxis2);  


         //Etiqueta para el eje x
   
         svg3.append('text')
             .attr('x', margen_etiquetax)
             .attr('y', height1-margen_inferior)
             .text("Numero de habitaciones")
             .attr('class', 'titulo14');
                    
         //Voy ahora con el eje y
   
         const yAxis2 = d3.axisLeft(scaleY2);

         svg3.append ('g')
             .attr ('class', 'axisY')
             .attr ('transform', `translate(${margen_ejey},0)`) //Podemos partir de 0,0 y ver que me hace falta trasladar a la derecha
             .call (yAxis2);

         //Etiqueta para el eje y
         svg3.append('text')
             .attr('transform', 'rotate(-90)')
             .attr('x', -220)
             .attr('y', margen_etiquetay)
             .text("Precio")
             .attr('class', 'titulo14');

         //Coloco arriba el nombre del barrio que deberá ir cambiando al dar al click

         svg3
            .append('text')
            .attr('x', posxbarrio)
            .attr('y', posybarrio)
            .text("Barrio: ")
            .attr('class', 'titulo14neg');
            
         svg3
            .append('text')
            .attr('x', posxbarrio)
            .attr('y', (posybarrio+espaciotrasbarrio))
            .text(barrio2.properties.name)
            .attr('class', 'titulo20');   


         //Voy a calcular ahora la linea de regresión
         linearRegression = ss.linearRegression(roomsprice.map(d => [d.bedrooms, d.price]))
         //console.log(linearRegression);
         //Esto nos devuelve un objeto con un m:slope y b:intercept
         //La ecuación de mi recta es y = mx + b
         //Necesito dos puntos para pintar la recta. El primero será para un x=0 == [0,b]
         //El segundo punto lo tomo para el máximo de x ==> [xmax, m*xmax+b]
         //Utilizo las escalas para colocarlo bien.

         if (isNaN (linearRegression.m) ) {
             //En este caso tenemos vivienas de solo un tamaño y diferentes precios
             //los puntos se colocan totalmente verticales y no es posible tener
             //la linea de regresión
                svg3.append('text')
                    .attr('x', 60)
                    .attr('y', 60)
                    .text("No es posible obtener la linea de regresion")
                    .attr('class', 'titulo14')
                    .attr('class', 'red');
                    //console.log ("Nan");
         } else {

               svg3.append('line')
                   .attr('x1', (d) => { //Evito dibujar coordenadas y negativas
                       if (linearRegression.b>=0) {
                           return (scaleX2(0))
                       } else {
                           return (scaleX2 (-linearRegression.b/linearRegression.m))
                       }
        
                   })
                 .attr('y1', (d)=> {  //Evito dibujar coordenadas y negativas
                       if (linearRegression.b>=0) {
                           return (scaleY2(linearRegression.b))
                        } else {
                           return (scaleY2(0))
                        }    
                  })
                 .attr('x2', scaleX2(xmax2))
                 .attr('y2', (d)=>scaleY2(((xmax2*linearRegression.m)+linearRegression.b)))
                 .style ('stroke-width', 2)
                 .style('stroke', 'red')
                 .on('mouseover', mouseoverline)  //Quiero que al pasar por la linea salga la ecuación de la recta
                 .on('mousemove', mousemoveline)
                 .on('mouseout', mouseoutline);
         }

     } //Termina función de actualización

    //Acciones del mouse
    //Muestro la ecuación de la recta cuando paso por encima

    function mouseoverline (){
        tooltip2.transition()
           .duration(10)
           .style ('opacity', .9);
    }

    function mousemoveline(d) {
        const m = parseFloat (linearRegression.m).toFixed(2);
        const b = parseFloat (linearRegression.b).toFixed(2);
        tooltip2.html("Precio="+m+"* N Hab + "+ b )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 50) + "px");

    }

    function mouseoutline(){
        tooltip2.transition()
                .duration(800)
                .style("opacity", 0);
    }


    
  
  

});