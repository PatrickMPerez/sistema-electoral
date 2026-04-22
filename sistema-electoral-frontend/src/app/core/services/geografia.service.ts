import { Injectable } from '@angular/core';

export interface Departamento {
  nombre: string;
  distritos: string[];
}

@Injectable({ providedIn: 'root' })
export class GeografiaService {

  /** Jerarquía completa: 17 departamentos + sus distritos  */
  private readonly data: Departamento[] = [
    {
      nombre: 'CONCEPCIÓN',
      distritos: [
        'CONCEPCIÓN','HORQUETA','BELÉN','LORETO',
        'SGT. JOSÉ FÉLIX LÓPEZ','SAN LÁZARO','YBY YAÚ',
        'AZOTE\'Y','PASO BARRETO','YBYRAROBANÁ',
      ],
    },
    {
      nombre: 'SAN PEDRO',
      distritos: [
        'SAN PEDRO DEL YKUAMANDYYU','ANTEQUERA','CHORÉ',
        'GENERAL ELIZARDO AQUINO','GENERAL RESQUÍN','GUAYAIBÍ',
        'ITACURUBÍ DEL ROSARIO','LIMA','NUEVA GERMANIA',
        'SAN ESTANISLAO','SAN PABLO','TACUATÍ','UNIÓN',
        'VILLA DEL ROSARIO','25 DE DICIEMBRE','YRYBUCUÁ',
        'SANTA ROSA DEL AGUARAY','LIBERACIÓN','RÍO VERDE',
      ],
    },
    {
      nombre: 'CORDILLERA',
      distritos: [
        'CAACUPÉ','ALTOS','ARROYOS Y ESTEROS','ATYRA',
        'CARAGUATAY','EMBOSCADA','ITACURUBÍ DE LA CORDILLERA',
        'JUAN DE MENA','LOMA GRANDE','MBOCAYATY DEL YHAGUY',
        'NUEVA COLOMBIA','PIRIBEBUY','PRIMERO DE MARZO',
        'SAN BERNARDINO','SAN JOSÉ OBRERO','SANTA ELENA',
        'TOBATÍ','VALENZUELA','JOSÉ DOMINGO OCAMPOS',
      ],
    },
    {
      nombre: 'GUAIRÁ',
      distritos: [
        'VILLARRICA','BORJA','CAPITÁN MAURICIO JOSÉ TROCHE',
        'CORONEL MARTÍNEZ','FÉLIX PÉREZ CARDOZO',
        'GENERAL EUGENIO ALEJANDRINO GARAY','ITURBE',
        'JOSÉ FASSARDI','MBOCAYATY','NATALICIO TALAVERA',
        'ÑUMÍ','SAN SALVADOR','YATAITY',
        'DOCTOR BOTTRELL','PASO YOBÁI','TEBICUARYMI',
      ],
    },
    {
      nombre: 'CAAGUAZÚ',
      distritos: [
        'CORONEL OVIEDO','CAAGUAZÚ','CARAYAÓ',
        'DOCTOR CECILIO BÁEZ','DOCTOR JUAN MANUEL FRUTOS',
        'NUEVA LONDRES','REPATRIACIÓN','SAN JOAQUÍN',
        'SAN JOSÉ DE LOS ARROYOS','SIMÓN BOLÍVAR','YHÚ',
        'R.I.3 CORRALES','MBUTUY','JUAN E. O\'LEARY',
        'RAÚL ARSENIO OVIEDO','VAQUERÍA','TEMBIAPORÃ',
        '3 DE FEBRERO',
      ],
    },
    {
      nombre: 'CAAZAPÁ',
      distritos: [
        'CAAZAPÁ','ABAÍ','BUENA VISTA',
        'DOCTOR MOISÉS SANTIAGO BERTONI',
        'GENERAL HIGINIO MORÍNIGO','MACIEL',
        'SAN JUAN NEPOMUCENO','SAN PEDRO DEL PARANÁ',
        'TAVAÍ','YUTY','3 DE MAYO',
      ],
    },
    {
      nombre: 'ITAPÚA',
      distritos: [
        'ENCARNACIÓN','ALTO VERÁ','BELLA VISTA','CAMBYRETÁ',
        'CAPITÁN MEZA','CARMEN DEL PARANÁ','CORONEL BOGADO',
        'EDELIRA','FRAM','GENERAL ARTIGAS','HOHENAU','JESÚS',
        'JOSÉ LEANDRO OVIEDO','LA PAZ','MAYOR OTAÑO','NATALIO',
        'NUEVA ALBORADA','OBLIGADO','PIRAPÓ',
        'SAN COSME Y DAMIÁN','SAN JUAN DEL PARANÁ',
        'SANTA MARÍA DE FE','SANTA RITA',
        'TOMÁS ROMERO PEREIRA','TRINIDAD','YATYTAY',
      ],
    },
    {
      nombre: 'MISIONES',
      distritos: [
        'SAN JUAN BAUTISTA','AYOLAS','SAN IGNACIO',
        'SAN MIGUEL','SAN PATRICIO','SANTA MARÍA',
        'SANTA ROSA','SANTIAGO','VILLA FLORIDA','YABEBYRY',
      ],
    },
    {
      nombre: 'PARAGUARÍ',
      distritos: [
        'PARAGUARÍ','ACAHAY','CAAPUCÚ','CARAPEGUÁ','ESCOBAR',
        'GENERAL BERNARDINO CABALLERO','LA COLMENA',
        'MBUYAPEY','PIRAYÚ','QUIINDY','QUYQUYHÓ',
        'SAN ROQUE GONZÁLEZ DE SANTA CRUZ','SAPUCAÍ',
        'TEBICUARY','YAGUARÓN','YBYCUÍ','YBYTYMÍ',
      ],
    },
    {
      nombre: 'ALTO PARANÁ',
      distritos: [
        'CIUDAD DEL ESTE','PRESIDENTE FRANCO',
        'DOMINGO MARTÍNEZ DE IRALA',
        'DR. JUAN LEÓN MALLORQUÍN','HERNANDARIAS',
        'ITAKYRY','JUAN E. O\'LEARY','LOS CEDRALES',
        'MBARACAYÚ','MINGA GUAZÚ','MINGA PORÃ',
        'NARANJAL','ÑACUNDAY','RAÚL ARSENIO OVIEDO',
        'SAN ALBERTO','SAN CRISTÓBAL','SANTA FE DEL PARANÁ',
        'SANTA RITA','SANTA ROSA DEL MONDAY','TAVAPY','YGUAZÚ',
      ],
    },
    {
      nombre: 'CENTRAL',
      distritos: [
        'AREGUÁ','CAPIATÁ','FERNANDO DE LA MORA',
        'GUARAMBARÉ','ITÁ','ITAUGUÁ',
        'J. AUGUSTO SALDÍVAR','LAMBARÉ','LIMPIO','LUQUE',
        'MARIANO ROQUE ALONSO','NUEVA ITALIA','ÑEMBY',
        'SAN ANTONIO','SAN LORENZO','VILLA ELISA',
        'VILLETA','YPACARAÍ','YPANÉ',
      ],
    },
    {
      nombre: 'ÑEEMBUCÚ',
      distritos: [
        'PILAR','ALBERDI','CERRITO','DESMOCHADOS',
        'GENERAL JOSÉ EDUVIGIS DÍAZ','GUAZÚ CUÁ',
        'HUMAITÁ','ISLA UMBÚ','LAURELES',
        'MAYOR JOSÉ J. MARTÍNEZ','PASO DE PATRIA',
        'SAN JUAN BAUTISTA DEL ÑEEMBUCÚ','TACUARAS',
        'VILLA FRANCA','VILLA OLIVA','VILLALBÍN',
      ],
    },
    {
      nombre: 'AMAMBAY',
      distritos: [
        'PEDRO JUAN CABALLERO','BELLA VISTA NORTE',
        'CAPITÁN BADO','ZANJA PYTÃ','KARAPÃ\'I',
      ],
    },
    {
      nombre: 'CANINDEYÚ',
      distritos: [
        'SALTO DEL GUAIRÁ','CORPUS CHRISTI','CURUGUATY',
        'GENERAL FRANCISCO ÁLVAREZ','ITANARÁ','KATUETÉ',
        'LA PALOMA','MARACANÁ','MINGA PORÃ',
        'NUEVA ESPERANZA','YASY CAÑY','YPEJHÚ',
        'VILLA YGATIMÍ',
      ],
    },
    {
      nombre: 'PRESIDENTE HAYES',
      distritos: [
        'VILLA HAYES','BENJAMÍN ACEVAL','JOSÉ FALCÓN',
        'NANAWA','NUEVA ASUNCIÓN','POZO COLORADO',
        'PUERTO PINASCO','TENIENTE ESTEBAN MARTÍNEZ',
        'TENIENTE PRIMERO MANUEL IRALA FERNÁNDEZ',
      ],
    },
    {
      nombre: 'ALTO PARAGUAY',
      distritos: [
        'FUERTE OLIMPO','BAHÍA NEGRA','CARMELO PERALTA',
      ],
    },
    {
      nombre: 'BOQUERÓN',
      distritos: [
        'FILADELFIA','LOMA PLATA',
        'MARISCAL JOSÉ FÉLIX ESTIGARRIBIA',
      ],
    },
  ];

  /** Lista de departamentos ordenados alfabéticamente */
  getDepartamentos(): string[] {
    return this.data
      .map(d => d.nombre)
      .sort((a, b) => a.localeCompare(b));
  }

  /** Distritos del departamento seleccionado, ordenados alfabéticamente */
  getDistritos(departamento: string): string[] {
    const found = this.data.find(
      d => this.norm(d.nombre) === this.norm(departamento)
    );
    return found
      ? [...found.distritos].sort((a, b) => a.localeCompare(b))
      : [];
  }

  /**
   * Dado un valor que puede venir sin tildes (ej: "CONCEPCION" del Excel),
   * devuelve el nombre canónico del departamento con tildes (ej: "CONCEPCIÓN").
   * Si no hay coincidencia, devuelve el valor original.
   */
  matchDepartamento(valor: string): string {
    if (!valor) return valor;
    const found = this.data.find(d => this.norm(d.nombre) === this.norm(valor));
    return found ? found.nombre : valor;
  }

  /** Todos los datos (para filtros avanzados) */
  getAll(): Departamento[] {
    return this.data;
  }

  /** Quita tildes y pasa a mayúsculas para comparación */
  private norm(s: string): string {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
  }
}
